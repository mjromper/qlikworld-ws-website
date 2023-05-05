const axios = require("axios");

async function runQlikAutomation(details, email) {
  
  let automationUrl = details.qaUrl;
  let automationToken = details.qaToken;
  
  try {
    var result = await axios({
      method: "post",
      url: automationUrl,
      headers: {
        "X-Execution-Token": automationToken,
      },
      data: {
        email: email,
      },
    });
    
    console.log(`Executed Qlik Automation '${automationUrl}' for user '${email}'`);

    return result.data;
  } catch (error) {
    return {error: error};
  }
}

module.exports.runQlikAutomation = runQlikAutomation;
