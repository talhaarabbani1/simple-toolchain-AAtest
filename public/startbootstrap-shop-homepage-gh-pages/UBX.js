ibm_ubx = {};
ibm_ubx.host = "https://api-01.ubx.ibmmarketingcloud.com";
ibm_ubx.eventApi = "/v1/event";
ibm_ubx.requestType = "POST";
ibm_ubx.contentType = "application/json";
ibm_ubx.async = true;
ibm_ubx.authKey = "PXoDAAAAAABNI_QZSeFEwuiVAuFPBIuhpQcxFXL0YcC735V4A-Vl8g:US";

/**
 * Constructs and sends UBX events to UBX. It can be a single or multiple UBX events.
 *
 * We accept the following event object format:
 *   {
 *       eventCode: "ibmproductView",
 *       identifiers: {cookieId: "455739626", Email: "abc@gmail.com"},
 *       attributes: {productID: "1234", productName: "Computer Monitor"}
 *   }
 * or
 *   {
 *       eventCode: "ibmproductView",
 *       identifiers: [
 *           {name: "cookieId", value: "455739626"},
 *           {name: "Email", value: "abc@gmail.com"}
 *       ],
 *       attributes: [
 *           {name: "productID", value: "6789", type: "Number"},
 *           {name: "productName", value: "Leather High-Back Office Chair"}
 *       ]
 *   }
 *
 */

/**
 * Builds and sends a single UBX event
 *
 * @param eventObject a single event object
 */
ibm_ubx.sendEvent = function(eventObject)
{
    try
    {
        var eventList = [eventObject];
        ibm_ubx.sendEvents(eventList);
    }
    catch (err) {
        console.log('Error:'+err.message);
    }
};

/**
 * Builds and sends a lost of UBX events
 *
 * @param eventList a list of event objects
 */
ibm_ubx.sendEvents = function(eventList)
{
    try
    {
        var eventJson = ibm_ubx.buildEvent(eventList);
        if (eventJson)
            ibm_ubx.postEvent(eventJson);
    }
    catch (err) {
        console.log('Error:'+err.message);
    }
};

/**
 * Posts UBX event json to UBX
 *
 * @param eventJson UBX event json
 */
ibm_ubx.postEvent = function(eventJson)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState == 4)
        {
            console.log('Send event to UBX - Response: '+xhttp.responseText+ '. Status: '+xhttp.status);
        }
    };

    xhttp.open(ibm_ubx.requestType, ibm_ubx.host + ibm_ubx.eventApi, ibm_ubx.async);
    xhttp.setRequestHeader("Content-type", ibm_ubx.contentType);
    xhttp.setRequestHeader("Authorization", "Bearer " + ibm_ubx.authKey);
    xhttp.send(eventJson);
};

/**
 * Builds UBX event json
 *
 * @param eventList a list of event objects
 *
 * @returns UBX event json
 */
ibm_ubx.buildEvent = function(eventList)
{
    try
    {
        var eventJson = '{"events":[';

        if (eventList && Array.isArray(eventList))
        {
            for (i = 0; i < eventList.length; i++)
            {
                if (i > 0)
                    eventJson += ',';

                var eventObj = eventList[i];
                eventJson += '{';
                eventJson += ibm_ubx.renderLabelValue("code", eventObj.eventCode);
                var eventChannel = eventObj.eventChannel;
                if (!eventChannel)
                    eventChannel = "Web";
                eventJson += ibm_ubx.renderLabelValue("channel", eventChannel);
                eventJson += ibm_ubx.renderLabelValue("timestamp", new Date().toJSON());

                // start of attributes
                eventJson += '"attributes":[';
                if (eventObj.attributes)
                {
                    if (Array.isArray(eventObj.attributes))
                    {
                        for (a = 0; a < eventObj.attributes.length; a++)
                        {
                            if (a > 0)
                                eventJson += ',';

                            eventJson += ibm_ubx.renderNameValueType(eventObj.attributes[a]);
                        }
                    }
                    else
                        eventJson += ibm_ubx.renderKeyValue(eventObj.attributes);
                }
                eventJson += '],';
                // end of attributes

                // start of identifiers
                eventJson += '"identifiers":[';
                if (eventObj.identifiers)
                {
                    if (Array.isArray(eventObj.identifiers))
                    {
                        for (b = 0; b < eventObj.identifiers.length; b++)
                        {
                            if (b > 0)
                                eventJson += ',';

                            eventJson += ibm_ubx.renderNameValueType(eventObj.identifiers[b]);
                        }
                    }
                    else
                        eventJson += ibm_ubx.renderKeyValue(eventObj.identifiers);
                }
                eventJson += ']';
                // end of identifiers

                eventJson += '}';
            }
        }
        else
        {
            console.log('Error: argument is not an array.');
            return null;
        }

        eventJson += ']}';

        return eventJson;
    }
    catch (err) {
        console.log('Error:'+err.message);
        return null;
    }
};

ibm_ubx.renderNameValueType=function(obj)
{
    var str = "";
    str += '{';
    str += ibm_ubx.renderLabelValue("name", obj.name, true);
    str += ibm_ubx.renderLabelValue("value", obj.value, true, ((typeof obj.type == 'undefined') || !obj.type));
    str += ibm_ubx.renderLabelValue("type", obj.type, false, true);
    str += '}';
    return str;
};

ibm_ubx.renderKeyValue=function(obj)
{
    var str = "";
    Object.keys(obj).forEach(function(key,index) {
        if (index > 0)
            str += ',';

        str += '{';
        str += ibm_ubx.renderLabelValue("name", key, true);
        str += ibm_ubx.renderLabelValue("value", obj[key], true, true);
        str += '}';
    });

    return str;
};

ibm_ubx.renderLabelValue=function(label, value, isRequired, isLast)
{
    var str = "";
    if ((typeof value !== 'undefined') && value)
    {
        str = '"' + label + '":"' + value + '"';
    }
    else if (isRequired)
    {
        str = '"' + label + '":""';
    }

    if (!isLast)
        str += ',';

    return str;
};
