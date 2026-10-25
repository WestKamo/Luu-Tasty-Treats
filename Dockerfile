# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files (pointing through the src folder)
COPY ["src/LuuTastyTreats.Api/LuuTastyTreats.Api.csproj", "src/LuuTastyTreats.Api/"]
RUN dotnet restore "src/LuuTastyTreats.Api/LuuTastyTreats.Api.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/src/src/LuuTastyTreats.Api"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "LuuTastyTreats.Api.dll"]
