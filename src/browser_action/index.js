const sessions = document.body.querySelector('.sessions');
const workspaces = document.body.querySelector('.workspaces');
const toolbar = document.body.querySelector('.toolbar');

const initStorage = () => {
    browser.storage.local.set({
        workspaces: [],
        sessions: [],
    });
};

(async function () {
    let storage = await browser.storage.local.get(null);
    if (Object.keys(storage).length == 0) {
        initStorage();
    } else {
        Object.keys(storage).forEach((item) => {
            let p = document.createElement('p');
            p.innerText = item;
            sessions.appendChild(p);
        });
    }
})();
