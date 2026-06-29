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
string palettePath = "memory/palettes.json";
string curatedPath = "memory/curated.json";
object fileLock = new object();

List<ActiveUser> activeUsers = new List<ActiveUser>();
object userLock = new object();

var jsonOptions = new JsonSerializerOptions 
{ 
    PropertyNameCaseInsensitive = true, // ignores upper/lowercase differences
    WriteIndented = true
};

app.MapPost("/api/visit", () =>
{
    lock (fileLock)
    {
        string json = File.ReadAllText(filePath);
        VisitData data = JsonSerializer.Deserialize<VisitData>(json, jsonOptions) ?? new VisitData();

        data.TotalVisits++;
        string newJson = JsonSerializer.Serialize(data, jsonOptions);
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
        data = JsonSerializer.Deserialize<VisitData>(json, jsonOptions) ?? new VisitData();
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

app.MapGet("/api/palettes", () =>
{
    lock (fileLock)
    {
        string json = File.ReadAllText(palettePath);
        var data = JsonSerializer.Deserialize<PaletteData>(json, jsonOptions);
        return Results.Ok(data?.Palettes ?? new List<Palette>());
    }
});

app.MapPost("/api/palettes", (Palette newPalette) =>
{
    newPalette.Date = DateTime.Now.ToShortDateString();
    
    lock (fileLock)
    {
        PaletteData data = new PaletteData();
        string json = File.ReadAllText(palettePath);
        data = JsonSerializer.Deserialize<PaletteData>(json, jsonOptions) ?? new PaletteData();
        
        data.Palettes.Add(newPalette);
        File.WriteAllText(palettePath, JsonSerializer.Serialize(data, jsonOptions));
    }
    return Results.Ok();
});

app.MapGet("/api/palettes/curated", () =>
{
    lock (fileLock) 
    {
        string json = File.ReadAllText(curatedPath);
        var data = JsonSerializer.Deserialize<PaletteData>(json, jsonOptions);
        return Results.Ok(data?.Palettes ?? new List<Palette>());
    }
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

public class Palette
{
    public string Title { get; set; }
    public string C1 { get; set; }
    public string C2 { get; set; }
    public string Author { get; set; }
    public string Date { get; set; }
}

public class PaletteData
{
    public List<Palette> Palettes { get; set; } = new List<Palette>();
}