import { dataContainer, sessions, workspaces, toolbar } from './layout.js';

// initialise an empty storage structure in the browser's extensionStorage
const initStorage = () => {
    browser.storage.local.set({
        workspaces: [],
        sessions: [],
    });
};

// show an error message visually
const showError = (msg) => {
    toolbar.error.message.innerText = msg;
    toolbar.error.container.classList.remove('hidden');
    setTimeout(() => toolbar.error.container.classList.add('hidden'), 3000);
};

// generic utility method to get the list of sessions and workspaces
const getStorage = (key) => {
    return browser.storage.local.get(key || null);
};

// shows the main menu
const showMain = async () => {
    toolbar.edit.container.classList.add('hidden');
    toolbar.parent.classList.remove('hidden');
    toolbar.newWorkspace.classList.remove('hidden');

    showWorkspaces(await getStorage());
};

// show all workspaces
const showWorkspaces = (storage) => {
    // remove previous children, as they may be outdated
    Array.from(workspaces.querySelector('table').children).forEach((i) => i.remove());

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

// opens all URLs in the specified workspace
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

// saves a new workspace to the browser's extensionStorage
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
    } catch (err) {
        showError('Failed to load saved workspaces.');
    }
};

// open the edit menu
// argument is the name of the workspace to open
const openEditMenu = async (item) => {
    try {
        let s = await getStorage();
        let current = s.workspaces.find((i) => i.name == item);

        current.urls.forEach((i) => {
            let element = document.createElement('tr');

            let url = document.createElement('td');
            url.innerText = i;

            let remove = document.createElement('td');
            remove.innerText = 'X';
            remove.addEventListener('click', () => {
                url.style.textDecoration = 'line-through';
            });

            element.appendChild(url);
            element.appendChild(remove);

            toolbar.edit.urlContainer.querySelector('table').appendChild(element);
        });

        toolbar.edit.save.addEventListener('click', async () => {
            let kept = Array.from(toolbar.edit.urlContainer.children).filter(
                (i) => getComputedStyle(i.firstElementChild).textDecoration != 'line-through'
            );
            current.urls = s.workspaces.find((i) => i.name == item).urls.filter((i) => kept.indexOf(i) != -1);
            try {
                await browser.storage.local.set(s);
                toolbar.edit.save.setAttribute('disabled', true);
            } catch (err) {
                showError('Failed to save your changes.');
            }
        });

        toolbar.edit.container.dataset.editing = item;

        dataContainer.classList.add('hidden');
        toolbar.newWorkspace.classList.add('hidden');
        toolbar.edit.container.classList.remove('hidden');

        toolbar.edit.delete.addEventListener('click', async (e) => {
            s.workspaces = s.workspaces.filter((i) => i.name != item);
            try {
                await browser.storage.local.set(s);

                showMain();
                dataContainer.classList.remove('hidden');
            } catch (err) {
                showError('Failed to save your changes.');
            }
        });

        toolbar.edit.back.addEventListener('click', () => {
            showMain();
        });
    } catch (err) {
        showError('Failed to load this workspace.');
    }
};

// show the new workspace menu
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

// initialises skeleton storage if the user is new, otherwise shows all workspaces
(async function () {
    try {
        let storage = await browser.storage.local.get(null);
        if (Object.keys(storage).length == 0) {
            initStorage();
        } else {
            storage = storage;
            showWorkspaces(storage);
        }
    } catch (e) {
        showError('Failed to open your workspaces.');
    }
})();
