const useragent = hung.require('useragent'),
      Agent     = useragent.Agent;

/**
 * Check useragent
 * @param useragents
 * @return {{chrome: boolean, firefox: boolean, ie: boolean, mobile_safari: boolean, mozilla: boolean, opera: boolean, safari: boolean, webkit: boolean, android: boolean, version: *}}
 */
function is(useragents){
    let ua      = (useragents || '').toLowerCase(),
        details = {
            desktop: false,
            chrome: false,
            edge: false,
            firefox: false,
            ie: false,
            mobile_safari: false,
            mozilla: false,
            opera: false,
            safari: false,
            webkit: false,
            android: false,
            mobile: false,
            tablet: false,
            ios: false,
            iphone: false,
            ipad: false,
            window: false,
            unix: false,
            version: (ua.match(useragent.is.versionRE) || [0, "0"])[1]
        };
    
    [
        'chrome', 'firefox', 'ie', 'mozilla', 'opera', 'edge',
        'safari', 'webkit', 'android', 'iphone',
        'ipad', 'window', 'unix'].forEach(name =>{
        details[name] = ua.includes(name);
    });
    
    //test mobile
    details.mobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4)));
    
    //tablet
    details.tablet = details.tablet || details.ipad || (details.android && !details.mobile);
    
    //ios
    details.ios = details.iphone || details.ipad;
    
    //desktop
    details.desktop = !details.mobile && !details.tablet;
    
    return details;
}

const spiders = [
    /bot/i,
    /google/i,
    /Googlebot/i,
    /bingbot/i,
    /msnbot/i,
    /Mediapartners-Google/i,
    /AdsBot-Google/i,
    /AdsBot-Google-Mobile-Apps/i,
    /BingPreview/i,
    /spider/i,
    /facebookexternalhit/i,
    /simplepie/i,
    /yahooseeker/i,
    /embedly/i,
    /quora link preview/i,
    /outbrain/i,
    /vkshare/i,
    /monit/i,
    /Pingability/i,
    /Monitoring/i,
    /WinHttpRequest/i,
    /Apache-HttpClient/i,
    /getprismatic.com/i,
    /python-requests/i,
    /Twurly/i,
    /yandex/i,
    /browserproxy/i,
    /Monitoring/i,
    /webmeup-crawler/i,
    /Qwantify/i,
    /Yahoo! Slurp/i,
    /pinterest/i
];

function isSpider(ua){
    return spiders.some(function(spider){
        return spider.test(ua)
    })
}

/**
 * Spider
 */
hung.extend(Agent.prototype, {
    
    /**
     * Check is spider
     * @return {boolean}
     */
    isSpider: function(){
        if(this._isSpider === undefined){
            this._isSpider = isSpider(this.source);
        }
        return this._isSpider;
    }
    
});

//define details
Object.defineProperty(Agent.prototype, 'is', {
    
    get: function(){
        if(!this._details){
            this._details = is(this.source);
        }
        
        return this._details;
    }
    
});

export {isSpider};
export default useragent;