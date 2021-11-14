using System;
using System.Runtime.Serialization;
using PhotoBank.QueueLogic.Contracts;

namespace PhotoBank.QueueLogic.Utils
{
    public static class MessageSerialization
    {
        public static ReadOnlyMemory<byte> ToBytesReadOnlyMemory(Message message)
        {
            return BinarySerialization.ToBytesReadOnlyMemory(message);
        }

        public static byte[] ToBytesArray(Message message)
        {
            return BinarySerialization.ToBytesArray(message);
        }

        public static Message FromBytes(ReadOnlyMemory<byte> bytes)
        {
            try
            {
                return (Message)BinarySerialization.FromBytes(bytes);
            }
            catch (SerializationException e)
            {
                return null;
            }
        }
    }
}
