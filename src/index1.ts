import * as core from '@actions/core'
import * as github from '@actions/github'
import * as logging from '@google-cloud/logging'

async function run(): Promise<void> {
  try {
    // Get the JSON input from another action (replace 'previous-action-output' with the actual output name)
    const rawJson = core.getInput('json-input')
    const jsonData: { [key: string]: any } = JSON.parse(rawJson)

    // Mask the "token" key's value (replace with your desired masking logic)
    if (jsonData.hasOwnProperty('token')) {
      jsonData.token = '[MASKED]'
    } else {
      core.warning('Key "token" not found in the input JSON.')
    }

    // Configure GCP Logging client
    const projectId = core.getInput('project_id')
    const logName = core.getInput('log_name')
    const loggingClient = new logging.Logger(projectId, logName)

    // Create a log entry with the masked JSON
    const entry = loggingClient.entry({
      timestamp: new Date(),
      payload: jsonData
    })

    // Write the log entry to GCP Logging
    await loggingClient.log(entry)

    core.info('Masked JSON successfully written to GCP Logging.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
