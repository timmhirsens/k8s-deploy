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

    public async createDeploymentReference(environment: string, deploymentId:string, state: string) {

        const deploymentStatusUrl = `https://api.github.com/repos/${this._repository}/deployments/${deploymentId}/statuses`;
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

        return sendRequest(webRequest);
    }

    private _repository: string;
    private _token: string;
} 