import * as core from '@actions/core'
import * as fs from 'fs'
import { Logging } from '@google-cloud/logging'

async function run(): Promise<void> {
  try {
    const jsonFilePath: string = core.getInput('json_file')
    const tokenKey: string = core.getInput('token_key')
    const logName: string = 'masked-json-log' // You can customize the log name

    const rawData: string = fs.readFileSync(jsonFilePath, 'utf-8')
    const jsonData: { [key: string]: any } = JSON.parse(rawData)

    if (jsonData[tokenKey]) {
      jsonData[tokenKey] = '****'
    } else {
      core.setFailed(`Key "${tokenKey}" not found in the JSON file`)
      return
    }

    const maskedJson: string = JSON.stringify(jsonData, null, 2)
    console.log(maskedJson)

    // Log to Google Cloud Logging
    const logging = new Logging()
    const log = logging.log(logName)
    const metadata = {
      resource: { type: 'global' }
    }
    const entry = log.entry(metadata, jsonData)
    await log.write(entry)

    core.setOutput('masked_json', maskedJson)

    // Optionally, save the masked JSON to a new file
    const maskedJsonFilePath: string = jsonFilePath.replace(
      '.json',
      '_masked.json'
    )
    fs.writeFileSync(maskedJsonFilePath, maskedJson)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
