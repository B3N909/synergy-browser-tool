class PickleComplate {
    /**
     * 
     * @param {object} obj as tree object 
     */
    constructor(obj = null) {
        //set config
        this.config = obj.config;
        //set fetch parameters
        this.req_params = obj.request;
        //target element
        this.element = null;
        //static data 
        this.container = obj.data;
        //list div element
        this.sug_div = null;

        if(this.config.reqCallback === undefined) this.config.reqCallback = null;
        if(this.config.changeCallback === undefined) this.config.changeCallback = null;


        //start events
        this.staticEvents();
    }


    /**
     * this method will set events
     */
    staticEvents() {
        // key up event
        document.querySelectorAll(this.config.target+' input').forEach(e => {
            e.addEventListener('keyup', el => {
                if(this.config.changeCallback !== undefined && this.config.changeCallback!== null) this.config.changeCallback(el.target);
                if(el.target.value.trim().length>0){
                    this.element = el.target;
                    this.closeAllLists();
                    //if anything is match show list
                    setTimeout(() => {
                        this.getSuggests(el.target);
                    }, 30);
                }else{
                    this.closeAllLists();
                }

                if(this.config.changeCallback != null) this.config.changeCallback(el,el.target.value);
            });
        });

        //close all lists
        document.addEventListener("click", e => {
            //close all lists
            this.closeAllLists();
        });

        //listen item clicks
        document.querySelectorAll(this.config.target).forEach(e => {
            e.addEventListener('click', el => {
                if(el.target.classList.contains('picomplete-item')){
                    if(this.config.clickCallback !== undefined && this.config.clickCallback !== null){
                        //send target element and node data
                        this.config.clickCallback(this.element,this.container[el.target.getAttribute('data-index')])
                    }
                }
            });
        });
    }




    //#region event transactions
    /**
     * this method will close all lists
     */
    async closeAllLists() {
        /*close all autocomplete lists in the document*/
        let elms = document.querySelectorAll('.picomplete-items');
        for (let i = 0; i < elms.length; i++) {
            elms[i].parentNode.removeChild(elms[i]);
        }
        this.sug_div = null;
    }



    async getSuggests(el) {
        
        //check container type
        if(this.config.type === 'server'){
            await this.getData(el.value.toLowerCase());
        }
        //for each item in container
        if(this.container.length > 0){
            //first create div element for suggest
            this.sug_div = document.createElement('DIV');
            this.sug_div.classList.add('picomplete-items');
            for (let i = 0; i < this.container.length; i++) {
                // console.log(this.container[i]);
                if (this.container[i].text.toLowerCase().includes(el.value.toLowerCase()) || el.value.toLowerCase() === "") {
                    //create list item
                    let item = document.createElement('DIV');
                    //set class
                    item.classList.add('picomplete-item');
                    //set value
                    item.setAttribute('data-value',this.container[i].value);
                    //set value
                    item.setAttribute('data-index',i);
                    //set text
                    item.innerHTML = this.container[i].text;
                    //add item to list
                    this.sug_div.appendChild(item);
                }
            }
        }
        
        //add list to input 
        if(this.sug_div !== null) this.element.parentNode.appendChild(this.sug_div);
    }



    /**
     * this method will send request to given parameters and return list of results
     * @param {string} value 
     */
    async getData(value){
        //define if parameters is not defined
        if(this.req_params.params===undefined){
            this.req_params.params = {};
        }
        //set value to params
        this.req_params.params.value = value;
        await this.request({
            method: this.req_params.type,
            url: this.req_params.url,
            data:this.req_params.params
        },this.config.reqCallback).then(rsp => {
            this.container = [];
            if(rsp.length>0){
                for (let i = 0; i <rsp.length; i++) {
                    this.container.push({
                        value : rsp[i][this.req_params.value],
                        text : rsp[i][this.req_params.text],
                    });
                }
            }
        });
    }
    //#endregion



    /**
     * system request method
     * @param {json object} rqs 
     */
     async request(rqs, reqCallback = null) {
        let fD = new FormData();
        let rsp;
        const url_params = [];
        const op = {
            method: rqs['method'],
        };

        if(reqCallback !== null) rqs['data'] = reqCallback(rqs['data']);

        if (rqs['method'] !== 'GET') {
            op.body = fD;
            for (let key in rqs['data']) {
                fD.append(key, rqs['data'][key]);
            }
        }else{
            if(!rqs['url'].includes("&")){
                rqs['url']+='&';
            }
            for (let key in rqs['data']) {
                url_params.push(key+'='+rqs['data'][key]);
            }
            rqs['url']+=url_params.join('&');
        }

        rsp = await fetch(rqs['url'], op);

        return await rsp.json()
    }
}
