class SubscribableEvent{
    constructor(){
        this.subscribers = new Set()
    }
    Start(arg = undefined){
        this.subscribers.forEach(subscriber => {(arg ===undefined)? subscriber():subscriber(arg)});
    }
    Subscribe(obj){
        this.subscribers.add(obj)
        console.log("current subscribers:")
        console.log(this.subscribers)
        console.log("-------------------")
    }
}

export default SubscribableEvent
