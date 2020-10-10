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

const getStorage = () => {
    return browser.storage.local.get(null);
};

const launchWorkspace = async (workspace) => {
    let s = await getStorage();
    s.workspaces
        .filter((i) => i.name == workspace)[0]
        .urls.forEach((url) => {
            browser.tabs.create({
                url,
            });
        });
};

(async function () {
    let storage = await browser.storage.local.get(null);
    try {
        if (Object.keys(storage).length == 0) {
            initStorage();
        } else {
            storage = storage;
            storage.workspaces.forEach((item) => {
                let launch = document.createElement('p');
                launch.innerText = item.name;
                launch.addEventListener('click', (e) => {
                    launchWorkspace(item.name);
                });
                workspaces.appendChild(launch);
            });
        }
    } catch (e) {}
})();

const createNewWorkspace = async (urls, name) => {
    let s = await getStorage();

    s.workspaces.push({
        urls,
        name,
    });

    await browser.storage.local.set(s);
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
        newUrlInp.placeholder = 'URL...';
        newUrlInp.classList.add('new-workspace');
        toolbar.newWorkspaceMenu.urls.appendChild(newUrlInp);
    });

    toolbar.newWorkspaceMenu.submit.addEventListener('click', (event) => {
        let urls = Array.from(toolbar.newWorkspaceMenu.container.querySelectorAll('input[type="url"].new-workspace'))
            .filter((i) => i.value.length != 0)
            .map((i) => i.value);
        createNewWorkspace(urls, toolbar.newWorkspaceMenu.name.value);
    });
});
