﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;

namespace PhotoBank.QueueLogic.Utils
{
    public static class BinarySerialization
    {
        public static ReadOnlyMemory<byte> ToBytes(object instance)
        {
            var formatter = new BinaryFormatter();
            using (var memoryStream = new MemoryStream())
            {
                formatter.Serialize(memoryStream, instance);
                return new ReadOnlyMemory<byte>(memoryStream.ToArray());
            }
        }

        public static object FromBytes(Type type, ReadOnlyMemory<byte> bytes)
        {
            var formatter = new BinaryFormatter();
            using (var memoryStream = new MemoryStream(bytes.ToArray()))
            {
                var instance = formatter.Deserialize(memoryStream);
                return Convert.ChangeType(instance, type);
            }
        }

        public static object FromBytes(string typeName, ReadOnlyMemory<byte> bytes)
        {
            return FromBytes(Type.GetType(typeName), bytes);
        }
    }
}