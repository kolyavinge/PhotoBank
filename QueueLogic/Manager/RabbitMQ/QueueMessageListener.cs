﻿using System;
using System.Threading;
using Microsoft.Extensions.Logging;
using PhotoBank.QueueLogic.Contracts;
using PhotoBank.QueueLogic.Utils;
using RabbitMQ.Client;

namespace PhotoBank.QueueLogic.Manager.RabbitMQ
{
    class QueueMessageListener<TMessage> : IQueueMessageListener<TMessage> where TMessage : Message
    {
        private readonly string _queueName;
        private readonly string _messageGuid;
        private readonly ConnectionFactory _connectionFactory;

        public ILogger Logger { get; set; }

        public QueueMessageListener(string queueName, string messageGuid, ConnectionFactory connectionFactory)
        {
            _queueName = queueName;
            _messageGuid = messageGuid;
            _connectionFactory = connectionFactory;
        }

        public TMessage WaitForMessage()
        {
            TMessage message;
            while ((message = TryGetMessage()) == null) Thread.Sleep(200);
            return message;
        }

        private TMessage TryGetMessage()
        {
            using (var connection = _connectionFactory.CreateConnection())
            using (var model = connection.CreateModel())
            {
                BasicGetResult basicGetResult = null;
                while ((basicGetResult = model.BasicGet(_queueName, false)) != null)
                {
                    var messageContainerGuid = basicGetResult.BasicProperties.GetHeaderValue(MessageFieldConstants.MessageGuid);
                    Logger.LogInformation(String.Format("QueueMessageListener {0}. Wait message {1}. Recieve: {2}", GetHashCode(), _messageGuid, messageContainerGuid));
                    if (messageContainerGuid == _messageGuid)
                    {
                        model.BasicAck(basicGetResult.DeliveryTag, false); // отметка, что сообщение получено
                        var messageTypeName = basicGetResult.BasicProperties.GetHeaderValue(MessageFieldConstants.MessageType);
                        var message = (TMessage)BinarySerialization.FromBytes(messageTypeName, basicGetResult.Body);
                        return message;
                    }
                }
            }

            return null;
        }
    }
}
