FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Build context is SUPPGAIN/backend
COPY . ./
WORKDIR /src/src/SuppGain.Api

RUN dotnet restore "SuppGain.Api.csproj"
RUN dotnet publish "SuppGain.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SuppGain.Api.dll"]
