import * as core from '@actions/core';
import { WebRequest, WebResponse, sendRequest } from "./utilities/httpClient";

export class GitHubClient {
    constructor(repository: string, token: string) {
        this._repository = repository;
        this._token = token;
    }

    public async getWorkflows(): Promise<any> {
        const getWorkflowFileNameUrl = `https://api.github.com/repos/${this._repository}/actions/workflows`;
        const webRequest = new WebRequest();
        webRequest.method = "GET";
        webRequest.uri = getWorkflowFileNameUrl;
        webRequest.headers = {
            Authorization: `Bearer ${this._token}`
        };

        core.debug(`Getting workflows for repo: ${this._repository}`);
        const response: WebResponse = await sendRequest(webRequest);
        return Promise.resolve(response);
    }

    public async createDeployment() {
        const deploymentStatusUrl = `https://api.github.com/repos/${this._repository}/deployments`;
        const webRequest = new WebRequest();
        webRequest.method = "POST";
        webRequest.uri = deploymentStatusUrl;
        webRequest.headers = {
            Authorization: `Bearer ${this._token}`
        };
        webRequest.body = JSON.stringify({
            "ref": process.env.GITHUB_SHA
        });
        const response: WebResponse = await sendRequest(webRequest);
        console.log(JSON.stringify(response));
        this._deploymentId = response.body["id"];
        return Promise.resolve(response);
    }

    public async createDeploymentReference(environment: string, deploymentId:string, state: string) {
        console.log("Creating deployment ref", deploymentId, environment, state);

        const deploymentStatusUrl = `https://api.github.com/repos/${this._repository}/deployments/${this._deploymentId}/statuses`;
        const webRequest = new WebRequest();
        webRequest.method = "POST";
        webRequest.uri = deploymentStatusUrl;
        webRequest.headers = {
            Authorization: `Bearer ${this._token}`
        };
        webRequest.body = JSON.stringify({
            "state": state,
            "log_url": `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
            "description": "",
            "environment": environment,
            "environment_url": ""
        });
        const response: WebResponse = await sendRequest(webRequest);
        console.log(JSON.stringify(response));
        return Promise.resolve(response);
    }

    private _deploymentId: string;
    private _repository: string;
    private _token: string;
} 