function Eqconfiger(vnode) {

  var EQspec=vnode.attrs.mdl
  
  //~ var setglobs =vnode.attrs.setglobs
  
  var cafreq=hztostr(EQspec.afreq)
     ,cefreq=hztostr(EQspec.efreq)
     ,cbands=bntostr(EQspec.nfreq)
     ,clinea=EQspec.linear

  function submit(event){
    if(event)event.preventDefault()
    
    var d = roundsig(strtohz(cafreq),1000)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.afreq = d }
    cafreq = hztostr(d)
    
    d = roundsig(strtohz(cefreq),1000)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.efreq = d }
    cefreq = hztostr(d)

    d = cbands
    while(d.length && (!isFinite(d.substr(-1))) ) d=d.slice(0,-1)
    d=Math.floor(d);d=d<1?1:d>35?35:d
    if(isFinite(d)){ EQspec.nfreq = d }
    cbands=bntostr(EQspec.nfreq)
    setglobs()
    mount_graphic_eq()
  }
  
  function chkbx(c){
    EQspec.linear=c
    console.log(c)
    submit()
  }
  
  return {
    view: function() {

      return m("form.place-qw",{onsubmit:submit}, [
      
      m("fieldset.flex.four", {style:"padding: 0em;"},  [
        m("input", 
        {
          type:"submit",tabindex:"-1",
          style:{display:"none"},
          onsubmit:submit
        }
        )
        ,
        m("label", {style:{position:"relative"}} ,
        [
        m("div", {style:{position:"absolute",right:"0.7em",top:"0.3em",color:"#d5a"}}, "to")
        ,
        m("input",
        {
          oninput: m.withAttr("value", v=>{cafreq=v}),
          onblur: m.withAttr("value", v=>{cafreq=v}),
          value: cafreq
        }
        )
        ]
        )
        ,
        m("label", m("input",
        {
          oninput: m.withAttr("value", v=>{cefreq=v}),
          onblur: m.withAttr("value", v=>{cefreq=v}),
          value: cefreq
        }
        ))
        ,
        m("label", m("input",
        {
          oninput: m.withAttr("value", v=>{cbands=v}),
          value: cbands
        }
        ))
        ,
        m("label",{style:"padding:0.3em 4em 0.3em 0.5em;"}, [
          m("input[type=checkbox]",
          {
            onclick: m.withAttr("checked", chkbx),
            checked:EQspec.linear
          }
          )
         ,m("span.checkable","Linear")
        ]) 
      ]) //feildset
     ])  //form
    }    //view
  }      //rtn obj
}


function bntostr(c){ return c+" Bands" }
function hztostr(c){
  if(c>1000){ c=Math.round(c) ; c=c/1000+" KHz" }else{ c+=" Hz" }
  return c 
}

function strtohz(c){
  c=c.toLowerCase()
  if(c.substr(-1)==="z") c=c.slice(0,-1)
  if(c.substr(-1)==="h") c=c.slice(0,-1)
  if(c.substr(-1)==="k"){ c=c.slice(0,-1);c*=1000 }
  return c*1
}

function percenttostr(c){
  return c*100 +" %"; 
}

function strtopercent(c){
  c=roundsig( stripnan(c) , 1000 )
  return c*0.01
}

function secstostr(c){
  c=stripnan(c)
  return c + " s"
}

function strtosecs(c){
  c=roundsig( stripnan(c) , 1000 )
  return c	
}

function stripnan(c){
  c=""+c
  while(c.substr(-1)&&isNaN(parseFloat(c.substr(-1)))) c=c.slice(0,-1)
  return 1*c
}

function roundsig(c,d){ d=d||1e15; return Math.floor(c*d+0.5)/d } 

function Trillconfiger(vnode) {

  var Eqspec=vnode.attrs.mdl
  
  //~ var setglobs =vnode.attrs.setglobs
  
  var trillfreq=hztostr(EQspec.trillfreq)
     ,trillpow=percenttostr(EQspec.trillpow)
     ,trilltime=secstostr(EQspec.trilltime)
     ,bloop=""

  function submit(event){
    if(event)event.preventDefault()
    
    var d = strtohz(trillfreq)
    d=d<0?0:d>10000?10000:d
    if(isFinite(d)){ EQspec.trillfreq = d }
    
    d= strtopercent(trillpow)
    d=d<0?0:d>100?100:d 
    if(isFinite(d)){ EQspec.trillpow = d }

    d= strtosecs(trilltime)
    d=d<0.1?0.1:d>300?300:d 
    if(isFinite(d)){ EQspec.trilltime = d }
    
    trillfreq=hztostr(EQspec.trillfreq)
    trillpow=percenttostr(EQspec.trillpow)
    trilltime=secstostr(EQspec.trilltime)
    
    //setglobs()
  }

   
  return {
    view: function() {

      return m("form.place-qx",{onsubmit:submit},[
      
      m("fieldset.flex.four", {style:"padding-bottom: 0.1em;"}, [
        m("input", 
        {
          type:"submit",tabindex:"-1",
          style:"position: absolute; left: -9999px; width: 1px; height: 1px;",
          onsubmit:submit
        }
        )
        ,
        m("label", {style:{position:"relative"}} ,
        [
        m("div", {style:{position:"absolute",right:"0.7em",top:"0.3em",color:"#d5a"}}, "...Trill")
        ,
        m("input",
        {
          oninput: m.withAttr("value", v=>{ trillfreq=v }), 
          onblur: m.withAttr("value", v=>{ trillfreq=v ; submit()}), 
          value: trillfreq
        }
        )
        ]
        )
        ,
        m("label", {style:{position:"relative"}} , 
        [
        m("div", {style:{position:"absolute",right:"0.7em",top:"0.3em",color:"#d5a"}}, "...Power")
        ,
        m("input",
        { oninput: m.withAttr("value", v=>{trillpow=v}),
          onblur: m.withAttr("value", v=>{trillpow=v; submit()}),
          value: trillpow 
        }
        )
        ]
        
        ) 

        ,
        m("label", {style:{position:"relative"}} ,
        [
        m("div", {style:{position:"absolute",right:"0.7em",top:"0.3em",color:"#d5a"}}, "...Duration")
        ,
        m("input",
        {
          oninput: m.withAttr("value", v=>{trilltime=v}),
          onblur: m.withAttr("value", v=>{trilltime=v ; submit()}), //submit also
          value: trilltime
        }
        )
        ]
        )
        ,
        m("label", {style:{position:"relative"}} ,
        [
        m("div", {style:{position:"absolute",right:"0.7em",top:"0.3em",color:"#d5a"}}, "...Bloop")
        ,
        m("input",
        {
          oninput: m.withAttr("value", v=>{bloop=v.substr(v.length - 1) ; playrnd(bloop)}),
          value: bloop
        }
        )
        ]
        ) 
      ]) //feildset
     ])  //form
    }    //view
  }      //rtn obj
}

function bellbutton(vnode){
  
  var frqs = vnode.attrs.frqs
  var ky=vnode.attrs.ky
  
  function onclick(event){
    event.preventDefault()
    playztone(ky)
  }
  
  return{
    oncreate:(vnode) =>{ arch.bells[ky]=vnode.dom }
   ,view: function(vnode) {
      return m("svg[viewBox='0 0 133 133']", 
      { onclick:onclick,
        style:"width:1em; height:1em; padding:3px 0px 0px 0px;"
      },
      [ 
      m("circle",{cx:"50%",cy:"50%",r:"45%",stroke:"#eee",fill:"#02b"}) ,
      m("polygon[points=40,25 40,105 110,65]",{stroke:"#eee",fill:"#5fe"})
      
       ]
      )
    }
  }
}
/*
<rect fill="LightSKyBlue" stroke="grey" stroke-width="0.8%" y="5%" x="42%" width="16%" ry="1.1%" rx="7.5%" height="9%"></rect><rect fill="LightSeaGreen" stroke="dimgrey" stroke-width="0.8%" x="42%" width="16%" ry="1.1%" rx="7.5%" y="14%" height="81%"></rect><circle fill="#02b" stroke="#171757" stroke-width="1.2%" r="4.9%" cx="50%" cy="14%"></circle>
*/

function mc_eqlzr(vnode) { //attrs ceqmdl

  var ceqmdl = vnode.attrs.mdl
  
  var pwrs = ceqmdl.pwrs 
  var frqs = ceqmdl.frqs 
  var nb =pwrs.length
  
  var slider_def ={ 
    stateobj:ceqmdl.pwrs 
   ,frqs:ceqmdl.frqs
   ,statekey:0
   ,onclickextra:playztone 
   ,min:cmin ,max:cmax ,steps:40
   ,elstyle:{ border:"0px dashed black",width:slength,height:swide,margin:"auto" }
   ,horizontal:false
   ,knobsize:"4.8%"
   ,knobcolor:"#02b"
   ,strokecolor:"dimgrey"
   ,knobstrokecolor:"#370767"
   ,strokewidth:"0.8%"
   ,knobstrokewidth:"1.2%"
  }
  
  function submit(){ return }
  
  var foo =3
  
  return {
    
    //oninit: Eqstate.init, //?
    view: function() {
      
///<<<<<<<< 
return m("div",m("form",{onsubmit:submit},
      
  m("table", {className: "eqlzr"},
    m("tbody",[
      
      //row of inputs
      m("tr",
       Array.from({ length:nb} , function(v,ti){ 
        
        return m("td", {className: "frq_input_td"},
          //~ m("label",
          m("input",
          {
          style:"padding:0em; background-color:#59f; border-color:#0df; text-align:center" ,
          oninput: m.withAttr("value", v=>{frqs[ti]=v}) ,
          value: frqs[ti]
          }
          )
          //~ )
          
         )//m
        }
       )//Array.from 
      ), 
      
      //row of bells
      m("tr"
      ,marray(nb, function(ti){ 
        
        return m("td", 
          { className: "frqbell",style:"padding:0em; margin:auto; text-align:center;"},
          m( bellbutton, {ky:ti} )
         )//m
        },this
       )//marray 
      ),

      //row of sliders 
      m("tr",
            
        marray(nb, function(i){ //marray - make array of len
          var adef = JSON.parse(JSON.stringify(slider_def))
          adef.stateobj=ceqmdl.pwrs
          adef.statekey=i //hacky clone as defs are not read in order
          adef.onclickextra=playztone
          return m("td", {className: "frqcntrl",style:"margin:auto; text-align:center"},
                   m( levelsliderm, adef )
                 )//m
            },this) 
      )//,
      /*   //row of frequency adjust
      m("tr",
            
        marray(nb, function(i){ //marray - make array of len
          afqput.statekey=i
          return m("td", {className: "frqinput"},
                   m( minput, slider_def )
                 )//m
            },this) 
      ),
      */ 
          //tr	
    ])//tbody	
  )//table
))//form div 
      
    }//view 
    
  }//return obj
}//function view equalizer
