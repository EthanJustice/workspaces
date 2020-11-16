// contains JS bindings for HTML elements from index.html

// user's sessions and workspaces
const dataContainer = document.body.querySelector('.data');
// user's sessions (child of dataContainer)
const sessions = document.body.querySelector('.sessions');
// user's workspaces (child of dataContainer)
const workspaces = document.body.querySelector('.workspaces');
// tools for editing workspaces and sessions
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
        back: document.body.querySelector('#edit-back'),
        urlContainer: document.body.querySelector('#edit-urls'),
        save: document.body.querySelector('#edit-save'),
    },
};

export { dataContainer, sessions, workspaces, toolbar };
