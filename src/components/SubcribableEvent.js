class SubscribableEvent{
    constructor(){
        this.subscribers = new Set()
    }
    Start(arg = undefined){
        this.subscribers.forEach(subscriber => {(arg ===undefined)? subscriber():subscriber(arg)});
    }
    Subscribe(obj){
        this.subscribers.add(obj)
    }
}

export default SubscribableEvent
