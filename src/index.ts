import { browser } from 'webextension-polyfill-ts';

import { dataContainer, workspaces, toolbar } from './layout';

interface Storage {
    workspaces: Workspace[];
    sessions: Session[];
}

interface Workspace {
    urls: string[];
    name: string;
}

interface Session {}

// initialise an empty storage structure in the browser's extensionStorage
const initStorage = () => {
    browser.storage.local.set({
        workspaces: [],
        sessions: [],
    });
};

// show an error message visually
const showError = (msg: string) => {
    toolbar.error.message.innerText = msg;
    toolbar.error.container.classList.remove('hidden');
    setTimeout(() => toolbar.error.container.classList.add('hidden'), 3000);
};

// generic utility method to get the list of sessions and workspaces
const getStorage = (key = null): Promise<any> => {
    return browser.storage.local.get(key);
};

// shows the main menu
const showMain = async () => {
    toolbar.edit.container.classList.add('hidden');
    toolbar.parent.classList.remove('hidden');
    toolbar.newWorkspace.classList.remove('hidden');

    showWorkspaces(await getStorage());
};

// show all workspaces
const showWorkspaces = (storage: Storage) => {
    // remove previous children, as they may be outdated
    if (workspaces.querySelector('table') && workspaces.querySelector('table')?.children) {
        // @ts-expect-error
        Array.from(workspaces.querySelector('table').children).forEach((i) => i.remove());
    }

    storage.workspaces.forEach((item: Workspace) => {
        let container = document.createElement('tr');

        let name = document.createElement('td');
        name.innerText = item.name;

        let launch = document.createElement('td');
        launch.innerText = 'Launch';
        launch.classList.add('launch-btn');

        launch.addEventListener('click', () => {
            launchWorkspace(item.name);
        });

        let edit = document.createElement('td');
        edit.innerText = 'Edit';
        edit.classList.add('edit-btn');
        edit.addEventListener('click', () => openEditMenu(item.name));

        container.appendChild(name);
        container.appendChild(launch);
        container.appendChild(edit);
        workspaces.querySelector('table')?.appendChild(container);
    });
};

// opens all URLs in the specified workspace
const launchWorkspace = async (workspace: string) => {
    try {
        let s: Storage = await getStorage();
        s.workspaces
            .filter((i) => i.name == workspace)[0]
            .urls.forEach((url) => {
                browser.tabs.create({
                    url,
                });
            });
    } catch (error) {}
};

// saves a new workspace to the browser's extensionStorage
const createNewWorkspace = async (urls: string[], name: string) => {
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
const openEditMenu = async (item: string) => {
    try {
        let s: Storage = await getStorage();
        let current = s.workspaces.find((i) => i.name == item);

        if (typeof current == 'undefined') {
        } else if (current) {
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

                toolbar.edit.urlContainer.querySelector('table')?.appendChild(element);
            });

            toolbar.edit.save.addEventListener('click', async () => {
                let kept = Array.from(toolbar.edit.urlContainer.children).filter((i) => {
                    let e = i.firstElementChild;
                    if (e) {
                        return getComputedStyle(e).textDecoration != 'line-through';
                    } else {
                        return;
                    }
                });

                // @ts-expect-error
                // This shouldn't error, but I'm not sure how to signal to the TS compiler that it won't
                current.urls = s.workspaces.find((i) => i.name == item).urls.filter((i) => kept.indexOf(i) != -1);
                try {
                    await browser.storage.local.set(s);
                    toolbar.edit.save.setAttribute('disabled', 'true');
                } catch (err) {
                    showError('Failed to save your changes.');
                }
            });

            toolbar.edit.container.dataset.editing = item;

            dataContainer.classList.add('hidden');
            toolbar.newWorkspace.classList.add('hidden');
            toolbar.edit.container.classList.remove('hidden');

            toolbar.edit.delete.addEventListener('click', async () => {
                s.workspaces = s.workspaces.filter((i) => i.name != item);
                try {
                    await browser.storage.local.set(s);

                    showMain();
                    dataContainer.classList.remove('hidden');
                } catch (_err) {
                    showError('Failed to save your changes.');
                }
            });

            toolbar.edit.back.addEventListener('click', () => {
                showMain();
            });
        }
    } catch (_err) {
        showError('Failed to load this workspace.');
    }
};

// show the new workspace menu
toolbar.newWorkspace.addEventListener('click', () => {
    console.log('Clicked');
    dataContainer.classList.add('hidden');
    toolbar.newWorkspace.classList.add('hidden');
    toolbar.newWorkspaceMenu.container.classList.remove('hidden');

    toolbar.newWorkspaceMenu.newUrl.addEventListener('click', () => {
        let newUrlInp = document.createElement('input');
        newUrlInp.type = 'url';
        newUrlInp.placeholder = 'URL...';
        newUrlInp.classList.add('new-workspace');
        toolbar.newWorkspaceMenu.urls.appendChild(newUrlInp);
    });

    toolbar.newWorkspaceMenu.name.addEventListener('input', () => {
        let v = toolbar.newWorkspaceMenu.name.getAttribute('value');
        if (v) {
            v.length > 0
                ? toolbar.newWorkspaceMenu.submit.removeAttribute('disabled')
                : toolbar.newWorkspaceMenu.submit.setAttribute('disabled', '');
        }
    });

    toolbar.newWorkspaceMenu.submit.addEventListener('click', async () => {
        let urls = Array.from(
            toolbar.newWorkspaceMenu.container.querySelectorAll<HTMLElement>('input[type="url"].new-workspace')
        )
            .filter((i) => i.getAttribute('value')?.length != 0)
            .map((i) => {
                let v = i.getAttribute('value') as string;
                return v.startsWith('http') ? v : `http://${v}`;
            });

        let value = toolbar.newWorkspaceMenu.name.getAttribute('value');
        if (value) {
            createNewWorkspace(urls, value);
            toolbar.newWorkspaceMenu.container.classList.add('hidden');
            dataContainer.classList.remove('hidden');
            toolbar.newWorkspace.classList.remove('hidden');
        }
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
            // todo: fix type error
            // @ts-expect-error
            showWorkspaces(storage);
        }
    } catch (_e) {
        showError('Failed to open your workspaces.');
    }
})();
