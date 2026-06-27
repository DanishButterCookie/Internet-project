using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.WebHost.UseSetting(WebHostDefaults.DetailedErrorsKey, "true");

var app = builder.Build();

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

string filePath = "memory/visits.json";
object fileLock = new object();

List<ActiveUser> activeUsers = new List<ActiveUser>();
object userLock = new object();

app.MapPost("/api/visit", () =>
{
    lock (fileLock)
    {
        string json = File.ReadAllText(filePath);
        VisitData data = JsonSerializer.Deserialize<VisitData>(json) ?? new VisitData();

        data.TotalVisits++;
        string newJson = JsonSerializer.Serialize(data);
        File.WriteAllText(filePath, newJson);
    }
    
    return Results.Ok();
});

app.MapGet("/api/stats/visits", () =>
{
    VisitData data;
    lock (fileLock)
    {
        string json = File.ReadAllText(filePath);
        data = JsonSerializer.Deserialize<VisitData>(json) ?? new VisitData();
    }

    int onlineCount = 0;
    lock (userLock)
    {
        DateTime cutoff = DateTime.Now.AddSeconds(-20);
        activeUsers.RemoveAll(u => u.LastSeen < cutoff);
        onlineCount = activeUsers.Count;
    }

    return Results.Ok(new { totalVisits = data.TotalVisits, onlineUsers = onlineCount });
});

app.MapPost("/api/users/join", () =>
{
    string newId = Guid.NewGuid().ToString();
    lock (userLock)
    {
        ActiveUser newUser = new ActiveUser();
        newUser.UserId = newId;
        newUser.LastSeen = DateTime.Now;
        activeUsers.Add(newUser);
    }
    return Results.Ok(new { id = newId });
});

app.MapPost("/api/users/heartbeat", (string id) =>
{
    lock (userLock)
    {
        ActiveUser user = null;
        foreach (var u in activeUsers)
        {
            if (u.UserId == id)
            {
                user = u;
                break;
            }
        }

        if (user != null)
        {
            user.LastSeen = DateTime.Now;
        }
    }
    return Results.Ok();
});

app.Run();

public class VisitData
{
    public int TotalVisits { get; set; }
}

public class ActiveUser
{
    public string UserId { get; set; }
    public DateTime LastSeen { get; set; }
}