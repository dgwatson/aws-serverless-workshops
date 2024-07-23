import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";

export const handler = async (event, context, callback) => {
    console.log("Reading input from event:\n", JSON.stringify(event));

    const srcBucket = event.s3Bucket;
    const srcKey = decodeURIComponent(event.s3Key.replace(/\+/g, " "));

    const rekognitionClient = new RekognitionClient({});

    const params = {
        Image: {
            S3Object: {
                Bucket: srcBucket,
                Name: srcKey
            }
        },
        Attributes: ['ALL']
    };

    try {
        const command = new DetectFacesCommand(params);
        const data = await rekognitionClient.send(command);

        console.log("Detection result from rekognition:\n", JSON.stringify(data));

        if (data.FaceDetails.length != 1) {
            callback(new PhotoDoesNotMeetRequirementError("Detected " + data.FaceDetails.length + " faces in the photo."));
        }
        if (data.FaceDetails[0].Sunglasses.Value === true){
            callback(new PhotoDoesNotMeetRequirementError("Face is wearing sunglasses"));
        }
        var detectedFaceDetails = data.FaceDetails[0];
        delete detectedFaceDetails['Landmarks'];

        callback(null, detectedFaceDetails);

    } catch (error) {
        console.log(error);
        if (error.code === "ImageTooLargeException"){
            callback(new PhotoDoesNotMeetRequirementError(error.message));
        }
        if (error.code === "InvalidImageFormatException"){
            callback(new PhotoDoesNotMeetRequirementError("Unsupported image file format. Only JPEG or PNG is supported"));
        }
        callback(error);
    }
};

function PhotoDoesNotMeetRequirementError(message) {
    this.name = "PhotoDoesNotMeetRequirementError";
    this.message = message;
}
PhotoDoesNotMeetRequirementError.prototype = new Error();