# ProductivityTools.Places

Start application
```
$env:NODE_ENV = "development"  
npm install
npm run start
```

## Firestore Migration

To migrate Firestore database data from one Firebase project to another, follow these steps using the `gcloud` CLI.

### Prerequisites

1.  **Install gcloud CLI**: Ensure you have the Google Cloud CLI installed.
2.  **Permissions**: You need the `Owner` or `Datastore Import Export Admin` role on both projects.

### Step 1: Export Data from Source Project

Set your active project to the source project and start the export operation.

```bash
# Set the source project
gcloud config set project [SOURCE_PROJECT_ID]

# Export data to a Cloud Storage bucket
gcloud firestore export gs://[BUCKET_NAME]
```
*Note: This will create a folder in your bucket named with a timestamp (e.g., `2026-04-11T20_23_45_12345`).*

### Step 2: Grant Permissions to Destination Project

If your Cloud Storage bucket is in the source project, you must grant the destination project's Firestore service agent permission to read from that bucket.

1.  Find the project number of your destination project.
2.  The service account name follows this pattern: `service-[DESTINATION_PROJECT_NUMBER]@gcp-sa-firestore.iam.gserviceaccount.com`.
3.  Grant this service account the **Storage Object Viewer** (`roles/storage.objectViewer`) role on the source bucket.

### Step 3: Import Data to Destination Project

Set your active project to the destination project and start the import operation.

```bash
# Set the destination project
gcloud config set project [DESTINATION_PROJECT_ID]

# Import data from the bucket
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_PREFIX]
```
*Replace `[EXPORT_PREFIX]` with the specific folder created by the export command.*