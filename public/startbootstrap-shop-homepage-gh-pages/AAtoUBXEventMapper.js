adobe_ubx = {};

adobe_ubx.sendEventFromJSONPayload=function(payloadJson, identifiersMapper, ubxEventType, attributesMapper)
{
    var eventMapper = adobe_ubx.createEventMapper(ubxEventType, identifiersMapper, attributesMapper);
    var eventObj = adobe_ubx.mapToUBXEvent(payloadJson, eventMapper);
    ibm_ubx.sendEvent(eventObj);
};

adobe_ubx.mapToUBXEvent=function(payloadJson, adobeUBXEventMapperObj)
{
    var eventObj = {};
    eventObj.eventCode = adobeUBXEventMapperObj.ubxEventType;
    eventObj.identifiers = adobe_ubx.createFieldArrayObject(payloadJson, adobeUBXEventMapperObj.identifiersMapper);
    eventObj.attributes = adobe_ubx.createFieldArrayObject(payloadJson, adobeUBXEventMapperObj.attributesMapper);
    return eventObj;
};

adobe_ubx.createFieldArrayObject=function(jsonObj, fieldMapper)
{
    var arr = [];
    for(var i = 0; i < fieldMapper.length; i++)
    {
        var fieldName = fieldMapper[i].name;
        var fieldValue = fieldMapper[i].value;
        if(fieldName && fieldValue)
        {
            arr.push(adobe_ubx.createNameValueTypeObject(fieldName, fieldValue, fieldMapper[i].type));
        }
        else {
            var adobeName = fieldMapper[i].adobeName;
            var ubxName = fieldMapper[i].ubxName;
            var type = fieldMapper[i].type;

            var value = adobe_ubx.getValue(jsonObj, adobeName);
            if(value)
                arr.push(adobe_ubx.createNameValueTypeObject(ubxName, value, type));
        }
    }

    return arr;
};

adobe_ubx.getValue=function(obj, key)
{
    if(obj)
    {
        var keys = key.split(".");
        var newObj = obj;
        for(var i=0; i<keys.length; i++)
        {
            if(newObj.hasOwnProperty(keys[i]))
            {
                newObj = newObj[keys[i]];
                if(i === keys.length - 1)
                    return newObj;

                continue;
            }
            else
                break;
        }
    }

    return null;
};

adobe_ubx.createNameValueTypeObject=function(name, value, type)
{
    var obj = {};
    obj.name=name;
    obj.value=value;
    if(type)
    {
        obj.type=type;
    }
    return obj;
};

adobe_ubx.createEventMapper=function(ubxEventType, identifiersMapper, attributesMapper)
{
    var eventMapper = {};
    eventMapper.ubxEventType = ubxEventType;
    eventMapper.identifiersMapper = identifiersMapper;
    eventMapper.attributesMapper = attributesMapper;
    return eventMapper;
};