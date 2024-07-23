import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";

export const handler = async (event, context, callback) => {
    console.log("Reading input from event:\n", JSON.stringify(event));

    const srcBucket = event.s3Bucket;
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

    const rekognitionClient = new RekognitionClient({});

    var params = {
        CollectionId: process.env.REKOGNITION_COLLECTION_ID,
        Image: {
            S3Object: {
                Bucket: srcBucket,
                Name: srcKey
            }
        },
        FaceMatchThreshold: 70.0,
        MaxFaces: 3
    };

    try {
        const command = new SearchFacesByImageCommand(params);
        const response = await rekognitionClient.send(command);

        console.log("Search results:", response);

        if (data.FaceMatches.length > 0) {
            callback(new FaceAlreadyExistsError());
        } else {
            callback(null, null);
        }

    } catch (error) {
        console.log(error);
        callback(error);
    }
};

function FaceAlreadyExistsError() {
    this.name = "FaceAlreadyExistsError";
    this.message = "Face in the picture is already in the system. ";
}
FaceAlreadyExistsError.prototype = new Error();