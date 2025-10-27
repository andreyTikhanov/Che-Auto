using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CheAuto.Database
{
    [BsonIgnoreExtraElements]
    public class Client
    {
        public ObjectId Id { get; set; }

        [BsonIgnoreIfNull]
        public string Name { get; set; }
        
        [BsonIgnoreIfNull]
        public string Telegram {  get; set; }
        
        [BsonIgnoreIfNull]
        public string Email { get; set; }
        
        [BsonIgnoreIfNull]
        public string PhoneNumber { get; set; }
    }
}
