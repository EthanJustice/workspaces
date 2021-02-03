// contains JS bindings for HTML elements from index.html
// all items have type assertions since they should theoretically never fail

// user's sessions and workspaces
const dataContainer = document.body.querySelector('.data') as HTMLElement;
// user's sessions (child of dataContainer)
const sessions = document.body.querySelector('.sessions') as HTMLElement;
// user's workspaces (child of dataContainer)
const workspaces = document.body.querySelector('.workspaces') as HTMLElement;
// tools for editing workspaces and sessions
const toolbar = {
    error: {
        container: document.body.querySelector('.error-container') as HTMLElement,
        message: document.body.querySelector('#error') as HTMLElement,
    },
    parent: document.body.querySelector('.toolbar') as HTMLElement,
    newWorkspace: document.body.querySelector('.toolbar input[type="button"][id="new-workspace"]') as HTMLElement,
    newWorkspaceMenu: {
        container: document.body.querySelector('.new-workspace') as HTMLElement,
        newUrl: document.body.querySelector('#add-new-workspace-url-inp') as HTMLElement,
        submit: document.body.querySelector('#add-new-workspace-submit') as HTMLElement,
        name: document.body.querySelector('#new-workspace-name') as HTMLElement,
        urls: document.body.querySelector('#new-workspace-urls') as HTMLElement,
    },
    edit: {
        container: document.body.querySelector('.edit') as HTMLElement,
        delete: document.body.querySelector('#edit-delete') as HTMLElement,
        back: document.body.querySelector('#edit-back') as HTMLElement,
        urlContainer: document.body.querySelector('#edit-urls') as HTMLElement,
        save: document.body.querySelector('#edit-save') as HTMLElement,
    },
};

export { dataContainer, sessions, workspaces, toolbar };
