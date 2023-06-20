import { ipcMain } from 'electron';
import IpcPcap from './ipc/pcap';

export default class Ipc {
    Application;
    loadedHandlers = {}

    handlers = [
        IpcPcap
    ]

    constructor(Application) {
        this.Application = Application
    }

    load() {
        for(const handlerName in this.handlers){
            this.loadedHandlers[handlerName] = new this.handlers[handlerName](this)
        }
    }
}