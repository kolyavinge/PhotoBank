﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PhotoBank.Broker.Api.Contracts
{
    public class LoginRequest
    {
        public string ClientId { get; set; }

        public string Login { get; set; }

        public string Password { get; set; }
    }
}
