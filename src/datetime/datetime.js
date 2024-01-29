import moment from 'moment';

class Datetime{
    
    /**
     * get Time now
     */
    now(){
        return Date.now();
    }
    
    /**
     * Check expired
     * @param value
     * @param timeout
     * @returns {boolean}
     */
    isExpired(value, timeout){
        if(!timeout){
            return false;
        }
        
        return ((hung.data.now() - value) > timeout);
    }
    
    /**
     * Format datetime
     * @param date
     * @param format
     * @returns {*|string}
     */
    fomat(date, format){
        if(!date){
            return "";
        }
        if(!format){
            format = "yyyy-MM-dd hh:mm:ss";
        }
        return moment(date).format(format);
    }
    
    /**
     * Format timestamp
     * @param date
     * @returns {*|string}
     */
    timestamp(date){
        if(!date){
            return "";
        }
        return moment(date).unix();
    }
    
    /**
     * Add datetime
     * @param date
     * @param number
     * @param type
     * @returns {*|string}
     */
    addDate(date, number, type){
        if(!date){
            return "";
        }
        return moment(date).add(number, type).format("YYYY-MM-DD");
    }
    
    /**
     * Sub datetime
     * @param date
     * @param number
     * @param type
     * @returns {*|string}
     */
    subDate(date, number, type){
        if(!date){
            return "";
        }
        return moment(date).subtract(number, type).format("YYYY-MM-DD");
    }
    
    /**
     * Get day of week
     * @param date
     * @returns {*|string}
     */
    getDayOfWeek(date){
        if(!date){
            return "";
        }
        return moment(date).day();
    }
    
    /**
     * Get day of month
     * @param date
     * @returns {*|string}
     */
    getMonth(date){
        if(!date){
            return "";
        }
        return moment(date).month();
    }
    
    /**
     * Get Day Current
     * @returns {*|string}
     */
    getDayCurrent(){
        return moment().date();
    }
    
    /**
     * Get Month Current
     * @returns {*|string}
     */
    getMonthCurrent(){
        return moment().month();
    }
    
    /**
     * Get Year Current
     * @returns {*|string}
     */
    getYearCurrent(){
        return moment().year();
    }
    
    /**
     * Get Hour Current
     * @returns {*|string}
     */
    getHourCurrent(){
        return moment().hour();
    }
    
    /**
     * Get Minute Current
     * @returns {*|string}
     */
    getMinuteCurrent(){
        return moment().minute();
    }
    
    /**
     * Get Second Current
     * @returns {*|string}
     */
    getSecondCurrent(){
        return moment().second();
    }
    
    /**
     * Get Millisecond Current
     * @returns {*|string}
     */
    getMillisecondCurrent(){
        return moment().millisecond();
    }
    
    /**
     * Get Date Current
     * @returns {*|string}
     */
    getDateCurrent(){
        return moment().format("YYYY-MM-DD");
    }
    
    /**
     * Get Time Current
     * @returns {*|string}
     */
    getTimeCurrent(){
        return moment().format("HH:mm:ss");
    }
    
    /**
     * Get Date Time Current
     * @returns {*|string}
     */
    getDateTimeCurrent(){
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }
    
    /**
     * Get the last day of month by month
     * @param month
     * @returns {*|string}
     */
    getLastDayOfMonth(month){
        if(!month){
            return "";
        }
        return moment().month(month).endOf('month').format("YYYY-MM-DD");
    }
    
}

hung.date = new Datetime();
hung.now = hung.date.now;
export default Datetime