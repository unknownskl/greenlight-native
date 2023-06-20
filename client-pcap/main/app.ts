import Ipc from './ipc'

export default class App {
    ipcHandler;

    constructor(){
        // Load IPC handlers
        const ipcHandler = new Ipc(this)
        ipcHandler.load()

        this.ipcHandler = ipcHandler
    }
}