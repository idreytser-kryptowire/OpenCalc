const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const FormData = require("form-data");
//const axios = require("axios").default;
const request = require("request")

/*
async function run() {
  try {
    // `path-to-file` input defined in action metadata file
    const pathToFile = core.getInput("path-to-file");
    console.log(`Path: ${pathToFile}`);
    if (fs.existsSync(pathToFile)) {
      console.log(`File Exists`);
    } else {
      console.log(`File Does Not Exist`);
    }

    // `platform` input defined in action metadata file
    const platform = core.getInput("platform");
    console.log(`Platform: ${platform}`);

    // `apiKey` input defined in action metadata file
    const apiKey = core.getInput("apiKey");
    console.log("API KEY: " + apiKey );
    

    // Create the form for Portal submission
    const form = new FormData();
    form.append("key", apiKey);
    form.append("platform", platform);
    form.append("app", fs.createReadStream(pathToFile));

    const formHeaders = form.getHeaders();
    try {
      const response = await axios.post(
        "https://emm.kryptowire.com/api/submit",
        form,
        {
          headers: {
            ...formHeaders
          },
          maxContentLength: Infinity
        }
      );
      console.log("KryptowireUUID: ", response.data.uuid);
    } catch (err) {
      console.log("Error with upload:", err);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
*/

async function downloadArtifact( uuid, apiKey, pathToFile ) {
    let elapsed_time = 0;

    while (true) {
        try {
            const url = `https://emm.kryptowire.com/api/results/sarif?uuid=${uuid}&regeneratePDF=false&key=${apiKey}`;
            const response = await fetch(url);

            if (response.status === 404) {
                console.log(`UUID: ${uuid}. Artifacts not ready yet, waiting...${elapsed_time}s`);
            } else if (!response.ok) {
                // Mimics response.raise_for_status()
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                // Handle successful response
                const contentDisposition = response.headers.get('content-disposition');
                
                if (contentDisposition) {
                    

                    // Convert response body to buffer and save
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    fs.writeFileSync(pathToFile + ".sarif", buffer);
                    
                    console.log(`Download complete. File saved as ${pathToFile}.`);
					
					
					
                    break;
                }
            }
        } catch (error) {
            if (error.name === 'TypeError' || error.code === 'ECONNREFUSED') {
                console.log(`Connection error. Retrying...${elapsed_time}s`);
                break;
            }
            throw error; // Rethrow other unexpected errors
        }

        // Wait for 20 seconds before next iteration
        await new Promise(resolve => setTimeout(resolve, 20000));
        elapsed_time += 20;
    }
}

async function run() {
  try {
    // `path-to-file` input defined in action metadata file
    const pathToFile = core.getInput("path-to-file");
    console.log(`Path: ${pathToFile}`);
    if (fs.existsSync(pathToFile)) {
      console.log(`File Exists`);
    } else {
      console.log(`File Does Not Exist`);
    }

    // `platform` input defined in action metadata file
    const platform = core.getInput("platform");
    console.log(`Platform: ${platform}`);

    // `apiKey` input defined in action metadata file
    const apiKey = core.getInput("apiKey");
    console.log("API KEY: " + apiKey );

    const formData = {
      "app": fs.createReadStream( pathToFile ),
      "key": apiKey,
      "platform": platform
    }

    request.post({url:'https://emm.kryptowire.com/api/submit', formData: formData}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        console.error('upload failed:', err);
      }
      console.log('Upload successful!  Server responded with:', body);
	  kwResponse = JSON.parse(body);
      console.log("KryptowireUUID: ", kwResponse.uuid);
	  downloadArtifact( kwResponse.uuid, apiKey, pathToFile );
    });
  
    
  } catch (err) {
      console.log("Error with upload:", err);
  }
}
run();
