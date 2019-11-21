const Webhook = require("webhook-discord");

class TrackerEvent {
    listeners;
    msg;
    constructor(name) {
        this.listeners = [];
        this.msg = new Webhook.MessageBuilder()
        .setName(name)
        .setColor("#ffffff");
    }

    AddListener(url) {
        this.listeners.push(new webhook.Webhook(url));
    }

    Invoke(...msg) {
        var sendMSG = this.msg
        .setText(msg.join(" "))
        .setTime();

        this.listeners.forEach(l=>l.send(sendMSG));
    }
}

module.exports = TrackerEvent;