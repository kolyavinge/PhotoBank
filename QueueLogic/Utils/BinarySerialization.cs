using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace PhotoBank.QueueLogic.Utils
{
    public static class BinarySerialization
    {
        public static ReadOnlyMemory<byte> ToBytesReadOnlyMemory(object instance)
        {
            var formatter = new BinaryFormatter();
            using (var memoryStream = new MemoryStream())
            {
                formatter.Serialize(memoryStream, instance);
                return new ReadOnlyMemory<byte>(memoryStream.ToArray());
            }
        }

        public static byte[] ToBytesArray(object instance)
        {
            var formatter = new BinaryFormatter();
            using (var memoryStream = new MemoryStream())
            {
                formatter.Serialize(memoryStream, instance);
                return memoryStream.ToArray();
            }
        }

        public static object FromBytes(ReadOnlyMemory<byte> bytes)
        {
            var formatter = new BinaryFormatter();
            using (var memoryStream = new MemoryStream(bytes.ToArray()))
            {
                memoryStream.Seek(0, SeekOrigin.Begin);
                var instance = formatter.Deserialize(memoryStream);
                return instance;
            }
        }
    }
}
