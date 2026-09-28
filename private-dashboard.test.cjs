const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function dashboard() {
    const elements = new Map();
    const element = () => ({ style: {}, dataset: {}, innerHTML: '', children: [], appendChild(child) { this.children.push(child); }, insertAdjacentHTML() {}, classList: { add() {}, remove() {} } });
    const context = vm.createContext({
        localStorage: { getItem() { return null; } }, location: { hostname: 'www.deepsaviors.xyz' },
        document: { getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); }, createElement: element },
        window: {}, console, setTimeout, AbortController, AbortSignal
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'dashboard.js'), 'utf8') + '\nthis.app = DS;', context);
    context.app.user = { id: '123', username: 'Staff' };
    context.app.toast = () => {};
    context.app.renderPanel = async () => {};
    return { app: context.app, elements };
}

test('server list excludes every guild except the private guild even if API returns others', async () => {
    const { app, elements } = dashboard();
    app.checkBotAPI = async () => ({ guilds: [{ id: '999', name: 'Foreign' }, { id: '1305511241577529354', name: 'Depths Saviors' }] });
    await app.showServers();
    assert.equal(elements.get('server-grid').children.length, 1);
    assert.match(elements.get('server-grid').children[0].innerHTML, /Depths Saviors/);
});

test('direct foreign guild selection cannot request or render its settings', async () => {
    const { app } = dashboard();
    let requests = 0;
    app.fetchAPI = async () => { requests++; return null; };
    app.showServers = async () => {};
    await app.loadGuild('999', { id: '999', name: 'Foreign' });
    assert.equal(requests, 0);
    assert.equal(app.currentGuild, null);
});

test('failed overview clears stale state and does not expose fallback settings', async () => {
    const { app, elements } = dashboard();
    app.currentGuild = { id: '1305511241577529354' };
    app.fetchAPI = async () => null;
    await app.loadGuild('1305511241577529354');
    assert.equal(app.currentGuild, null);
    assert.equal(elements.get('cog-nav').children.length, 0);
    assert.doesNotMatch(elements.get('dash-content').innerHTML, /Save Config|Gank Notifications/);
});

test('no access result offers staff support without a bot installation link', async () => {
    const { app, elements } = dashboard();
    app.checkBotAPI = async () => ({ guilds: [] });
    await app.showServers();
    assert.doesNotMatch(elements.get('server-grid').innerHTML, /Invite Bot|pilot servers/);
    assert.match(elements.get('server-grid').innerHTML, /Depths Saviors/);
});

test('authorized private overview exposes active modules and filters archived modules', async () => {
    const { app, elements } = dashboard();
    app.fetchAPI = async () => ({ guild: { id: '1305511241577529354', name: 'Depths Saviors' }, is_private: true, cogs: { antialt: {name: 'Verification', icon: 'fa-shield'}, gankping: {name: 'Retired', icon: 'fa-bullhorn'} } });
    await app.loadGuild('1305511241577529354');
    assert.equal(app.currentGuild.id, '1305511241577529354');
    assert.equal(elements.get('cog-nav').children.length, 1);
    assert.match(elements.get('cog-nav').children[0].innerHTML, /Verification/);
});

test('mismatched overview is rejected even when the requested guild was allowed', async () => {
    const { app, elements } = dashboard();
    app.fetchAPI = async () => ({ guild: { id: '999', name: 'Wrong server' }, is_private: true, cogs: {} });
    await app.loadGuild('1305511241577529354');
    assert.equal(app.currentGuild, null);
    assert.match(elements.get('dash-content').innerHTML, /Settings unavailable/);
});
