﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PhotoBank.Broker.Api.Contracts
{
    public class UploadPhotosRequest : AuthenticatedRequest
    {
        public IEnumerable<string> Files { get; set; }
    }
}