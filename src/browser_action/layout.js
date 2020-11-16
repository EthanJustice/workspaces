const dataContainer = document.body.querySelector('.data');
const sessions = document.body.querySelector('.sessions');
const workspaces = document.body.querySelector('.workspaces');
const toolbar = {
    error: {
        container: document.body.querySelector('.error-container'),
        message: document.body.querySelector('#error'),
    },
    parent: document.body.querySelector('.toolbar'),
    newWorkspace: document.body.querySelector('.toolbar input[type="button"][id="new-workspace"]'),
    newWorkspaceMenu: {
        container: document.body.querySelector('.new-workspace'),
        newUrl: document.body.querySelector('#add-new-workspace-url-inp'),
        submit: document.body.querySelector('#add-new-workspace-submit'),
        name: document.body.querySelector('#new-workspace-name'),
        urls: document.body.querySelector('#new-workspace-urls'),
    },
    edit: {
        container: document.body.querySelector('.edit'),
        delete: document.body.querySelector('#edit-delete'),
        urlContainer: document.body.querySelector('#edit-urls'),
    },
};

export { dataContainer, sessions, workspaces, toolbar };
