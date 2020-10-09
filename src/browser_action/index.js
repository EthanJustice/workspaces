const dataContainer = document.body.querySelector('.data');
const sessions = document.body.querySelector('.sessions');
const workspaces = document.body.querySelector('.workspaces');
const toolbar = {
    parent: document.body.querySelector('.toolbar'),
    newWorkspace: document.body.querySelector('.toolbar input[type="button"][id="new-workspace"]'),
    newWorkspaceMenu: {
        container: document.body.querySelector('.new-workspace'),
        newUrl: document.body.querySelector('#add-new-workspace-url-inp'),
        submit: document.body.querySelector('#add-new-workspace-submit'),
        name: document.body.querySelector('#new-workspace-name'),
        urls: document.body.querySelector('#new-workspace-urls'),
    },
};

const initStorage = () => {
    browser.storage.local.set({
        workspaces: [],
        sessions: [],
    });
};

let storage = {
    workspaces: [],
    sessions: [],
};

(async function () {
    let storage = await browser.storage.local.get(null);
    if (Object.keys(storage).length == 0) {
        initStorage();
    } else {
        storage = storage;
        console.log(storage);
    }
})();

const createNewWorkspace = async (urls, name) => {
    storage.workspaces.push({
        urls,
        name,
    });
    await browser.storage.local.set(storage);
    try {
        browser.storage.local.get(null).then((d) => console.log(d));
    } catch (err) {
        console.error(err);
    }
};

toolbar.newWorkspace.addEventListener('click', (e) => {
    dataContainer.classList.add('hidden');
    toolbar.newWorkspace.classList.add('hidden');
    toolbar.newWorkspaceMenu.container.classList.remove('hidden');

    toolbar.newWorkspaceMenu.newUrl.addEventListener('click', (event) => {
        let newUrlInp = document.createElement('input');
        newUrlInp.type = 'url';
        newUrlInp.classList.add('new-workspace');
        toolbar.newWorkspaceMenu.urls.appendChild(newUrlInp);
    });

    toolbar.newWorkspaceMenu.submit.addEventListener('click', (event) => {
        let urls = Array.from(
            toolbar.newWorkspaceMenu.container.querySelectorAll('input[type="url"].new-workspace')
        ).map((i) => i.value);
        console.log(urls, toolbar.newWorkspaceMenu.name);
        createNewWorkspace(urls, toolbar.newWorkspaceMenu.name.value);
    });
});
