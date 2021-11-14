using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using PhotoBank.QueueLogic.Contracts;
using PhotoBank.QueueLogic.Utils;
using RatMQ.Client;
using RatMQ.Contracts;

namespace PhotoBank.QueueLogic.Manager.RatMQ
{
    public class QueueManager : IQueueManager
    {
        private Broker _broker;

        public ILogger Logger { get; set; }

        public void Init(QueueManagerContext context)
        {
            var brokerIp = "127.0.0.1";
            var brokerPort = 55555;
            _broker = BrokerConnector.Connect(brokerIp, brokerPort, context.ClientPort);
        }

        public void SendMessage(string queueName, Message message)
        {
            var headers = new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>(MessageFieldConstants.MessageType, message.GetType().AssemblyQualifiedName),
                new KeyValuePair<string, object>(MessageFieldConstants.MessageChainId, message.ChainId.Value),
            };
            var queue = _broker.GetQueue(queueName);
            queue.SendMessage(headers, MessageSerialization.ToBytesArray(message));
        }

        public void AddMessageConsumer(string queueName, MessageConsumerCallback callback)
        {
            var queue = _broker.GetQueue(queueName);
            queue.AddConsumer(new MessageConsumer(callback));
        }
    }

    class MessageConsumer : IConsumer
    {
        private readonly MessageConsumerCallback _callback;

        public MessageConsumer(MessageConsumerCallback callback)
        {
            _callback = callback;
        }

        public void ConsumeMessage(ClientMessage clientMessage, ConsumeMessageResult result)
        {
            var message = MessageSerialization.FromBytes(clientMessage.Body);
            _callback(message);
            result.Commit();
        }
    }
}
