import { dataContainer, sessions, workspaces, toolbar } from './layout.js';

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

const showError = (msg) => {
    toolbar.error.message.innerText = msg;
    toolbar.error.container.classList.remove('hidden');
    setTimeout(() => toolbar.error.container.classList.add('hidden'), 3000);
};

const getStorage = (key) => {
    return browser.storage.local.get(key || null);
};

const showWorkspaces = (storage) => {
    storage.workspaces.forEach((item) => {
        let container = document.createElement('tr');

        let name = document.createElement('td');
        name.innerText = item.name;

        let launch = document.createElement('td');
        launch.innerText = 'Launch';
        launch.classList.add('launch-btn');

        launch.addEventListener('click', (e) => {
            launchWorkspace(item.name);
        });

        let edit = document.createElement('td');
        edit.innerText = 'Edit';
        edit.classList.add('edit-btn');
        edit.addEventListener('click', (e) => openEditMenu(item.name));

        container.appendChild(name);
        container.appendChild(launch);
        container.appendChild(edit);
        workspaces.querySelector('table').appendChild(container);
    });
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

const createNewWorkspace = async (urls, name) => {
    try {
        let s = await getStorage();

        s.workspaces.push({
            urls,
            name,
        });

        try {
            await browser.storage.local.set(s);
            showWorkspaces(s);
        } catch (err) {
            showError('Something went wrong while creating a new workspace.');
        }
    } catch (err) {}
};

const openEditMenu = async (item) => {
    toolbar.edit.container.dataset.editing = item;

    dataContainer.classList.add('hidden');
    toolbar.newWorkspace.classList.add('hidden');
    toolbar.edit.container.classList.remove('hidden');

    toolbar.edit.delete.addEventListener('click', async (e) => {
        let s = await getStorage();
        s.workspaces = s.workspaces.filter((i) => i.name != item);
        try {
            await browser.storage.local.set(s);
            toolbar.edit.container.classList.add('hidden');
            toolbar.parent.classList.remove('hidden');
            toolbar.newWorkspace.classList.remove('hidden');
            Array.from(dataContainer.children).forEach((i) => i.remove());
            showWorkspaces(s);
            dataContainer.classList.remove('hidden');
        } catch (err) {}
    });
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

    toolbar.newWorkspaceMenu.name.addEventListener('input', (e) =>
        toolbar.newWorkspaceMenu.name.value.length > 0
            ? toolbar.newWorkspaceMenu.submit.removeAttribute('disabled')
            : toolbar.newWorkspaceMenu.submit.setAttribute('disabled', '')
    );

    toolbar.newWorkspaceMenu.submit.addEventListener('click', async (event) => {
        let urls = Array.from(toolbar.newWorkspaceMenu.container.querySelectorAll('input[type="url"].new-workspace'))
            .filter((i) => i.value.length != 0)
            .map((i) => i.value);
        createNewWorkspace(urls, toolbar.newWorkspaceMenu.name.value);
        toolbar.newWorkspaceMenu.container.classList.add('hidden');
        dataContainer.classList.remove('hidden');
        toolbar.newWorkspace.classList.remove('hidden');
    });
});

(async function () {
    let storage = await browser.storage.local.get(null);
    try {
        if (Object.keys(storage).length == 0) {
            initStorage();
        } else {
            storage = storage;
            showWorkspaces(storage);
        }
    } catch (e) {}
})();
