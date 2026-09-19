# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["LuuTastyTreats.Api/LuuTastyTreats.Api.csproj", "LuuTastyTreats.Api/"]
RUN dotnet restore "LuuTastyTreats.Api/LuuTastyTreats.Api.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/src/LuuTastyTreats.Api"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose port and start app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "LuuTastyTreats.Api.dll"]
