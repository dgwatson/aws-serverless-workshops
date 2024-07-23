import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";

export const handler = async (event, context, callback) => {
    console.log("Reading input from event:\n", JSON.stringify(event));

    try {
        const srcBucket = event.s3Bucket;
        const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

        const rekognitionClient = new RekognitionClient({});

        const params = {
            CollectionId: process.env.REKOGNITION_COLLECTION_ID,
            Image: {
                S3Object: {
                    Bucket: srcBucket,
                    Name: srcKey
                }
            }
        };

        const indexFacesCommand = new IndexFacesCommand(params);
        const response = await rekognitionClient.send(indexFacesCommand);

        console.log("IndexFaces response:", response);
        callback(null, response['FaceRecords'][0]['Face']);

    } catch (error) {
        console.error(error);
        callback(error);
    }
};