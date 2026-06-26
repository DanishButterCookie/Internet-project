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
    return Results.Ok(data);
});

app.Run();

public class VisitData
{
    public int TotalVisits { get; set; }
}