FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Build context can be either:
# - SUPPGAIN/backend
# - repository root (contains SUPPGAIN/backend)
COPY . ./

RUN if [ -f "/src/src/SuppGain.Api/SuppGain.Api.csproj" ]; then \
      cd /src/src/SuppGain.Api; \
    elif [ -f "/src/SUPPGAIN/backend/src/SuppGain.Api/SuppGain.Api.csproj" ]; then \
      cd /src/SUPPGAIN/backend/src/SuppGain.Api; \
    else \
      echo "SuppGain.Api.csproj not found in expected locations."; \
      find /src -maxdepth 6 -name "SuppGain.Api.csproj" -print; \
      exit 1; \
    fi && \
    dotnet restore "SuppGain.Api.csproj" && \
    dotnet publish "SuppGain.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SuppGain.Api.dll"]
