#!/bin/bash

API_URL="http://localhost:3000/api"

echo "Testing API endpoints..."

# Test health endpoint
echo -e "\nHealth check:"
curl -s "${API_URL/\/api/}/health" | jq '.'

# Get applications
echo -e "\nGetting applications:"
curl -s "$API_URL/applications" | jq '.'

# Get regions
echo -e "\nGetting regions:"
curl -s "$API_URL/regions" | jq '.'

# Create a sample deployment
echo -e "\nCreating a deployment:"
curl -s -X POST "$API_URL/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 1,
    "regionId": 1,
    "date": "2023-11-01",
    "time": "14:30:00",
    "result": "success",
    "tag": "v1.0.0"
  }' | jq '.'

# Create another deployment
echo -e "\nCreating another deployment:"
curl -s -X POST "$API_URL/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 2,
    "regionId": 3,
    "date": "2023-11-02",
    "time": "09:15:00",
    "result": "failure",
    "tag": "v1.1.0"
  }' | jq '.'

# Get all deployments
echo -e "\nGetting all deployments:"
curl -s "$API_URL/deployments" | jq '.'

# Get deployments by application
echo -e "\nGetting deployments for application 1:"
curl -s "$API_URL/deployments/application/1" | jq '.'

# Get deployments by region
echo -e "\nGetting deployments for region 3:"
curl -s "$API_URL/deployments/region/3" | jq '.'

echo -e "\nAPI testing completed." 