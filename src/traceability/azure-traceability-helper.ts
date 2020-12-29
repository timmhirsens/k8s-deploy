import * as path from 'path';
import * as fs from 'fs';
import { DeploymentReport, TargetResource, Artifact } from '@azure/azure-actions-traceability';
import { WebRequest, WebRequestOptions, WebResponse, sendRequest, StatusCodes } from "../utilities/httpClient";
import * as InputParameters from "../input-parameters";
import * as core from '@actions/core';

interface AksResourceContext {
  subscriptionId: string;
  resourceGroup: string;
  clusterName: string;
  sessionToken: string;
  managementUrl: string;
}

function getAksResourceContext(): AksResourceContext {
  const runnerTempDirectory = process.env['RUNNER_TEMP'];
  const aksResourceContextPath = path.join(runnerTempDirectory, `aks-resource-context.json`);
  try {
    console.log(`Reading file: ${aksResourceContextPath}`);
    const rawContent = fs.readFileSync(aksResourceContextPath, 'utf-8');
    return JSON.parse(rawContent);
  } catch (ex) {
    return null;
    //throw new Error(`An error occured while reading/parsing the contents of the file: ${aksResourceContextPath}. Error: ${ex}`);
  }
}

async function createDeploymentResource(aksResourceContext: AksResourceContext, deploymentPayload: any): Promise<any> {
  const deploymentName = `${aksResourceContext.clusterName}-${InputParameters.namespace}-deployment-${process.env['GITHUB_SHA']}`;
  return new Promise<string>((resolve, reject) => {
    var webRequest = new WebRequest();
    webRequest.method = 'PUT';
    webRequest.uri = `${aksResourceContext.managementUrl}subscriptions/${aksResourceContext.subscriptionId}/resourceGroups/${aksResourceContext.resourceGroup}/providers/Microsoft.DeploymentCenterV2/deploymentsv2/${deploymentName}?api-version=2020-06-01-preview`;
    console.log(`Deployment resource URI: ${webRequest.uri}`);
    webRequest.headers = {
      'Authorization': 'Bearer ' + aksResourceContext.sessionToken,
      'Content-Type': 'application/json; charset=utf-8'
    }
    webRequest.body = JSON.stringify(deploymentPayload);
    sendRequest(webRequest).then((response: WebResponse) => {
      if (response.statusCode == StatusCodes.OK
        || response.statusCode == StatusCodes.CREATED
        || response.statusCode == StatusCodes.ACCEPTED) {
        resolve(response.body);
      } else {
        console.log(`An error occured while creating the deployment resource. Response body: '${JSON.stringify(response.body)}'`);
        reject(JSON.stringify(response.body));
      }
    }).catch(reject);
  });
}

export async function addTraceability(deployedManifestFiles: string[]): Promise<void> {
  const aksResourceContext = getAksResourceContext();
  createDeploymentReport(aksResourceContext, deployedManifestFiles);
  // try {
  //   console.log(`Trying to create the deployment resource with payload: \n${JSON.stringify(deploymentPayload)}`);
  //   const deploymentResource = await createDeploymentResource(aksResourceContext, deploymentPayload);
  //   console.log(`Deployment resource created successfully. Deployment resource object: \n${JSON.stringify(deploymentResource)}`);
  // } catch (error) {
  //   console.log(`Some error occured: ${error}`);
  // }
  return Promise.resolve();
}

function createDeploymentReport(context: AksResourceContext, deployedManifestFiles: string[]) {
  // const resource: TargetResource = {
  //   id: `/subscriptions/${context.subscriptionId}/resourceGroups/${context.resourceGroup}/providers/Microsoft.ContainerService/managedClusters/${context.clusterName}`,
  //   provider: 'Azure',
  //   type: 'Microsoft.ContainerService/managedClusters',
  //   properties: {
  //     manifests: deployedManifestFiles
  //   }
  // };

  // const artifact: Artifact = {
  //   type: 'container',
  //   properties: {}
  // };

  // const deploymentReport: DeploymentReport = new DeploymentReport([ artifact ], 'succeeded', resource);
  // const deploymentReportPath = deploymentReport.export();
  // core.setOutput('deployment-report', deploymentReportPath);
  deployedManifestFiles.forEach((manifest) => {
    console.log(manifest);
  });
}