function Eqconfiger(vnode) {

  var EQspec=vnode.attrs.mdl
  
  var cafreq=hztostr(EQspec.afreq)
     ,cefreq=hztostr(EQspec.efreq)
     ,cbands=bntostr(EQspec.nfreq)
     ,clinea=EQspec.linear
     
  function submit(event){
    if(event)event.preventDefault()
    
    var d = strtohz(cafreq)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.afreq = d }
    cafreq = hztostr(d)
    
    d = strtohz(cefreq)
    d=d<20?20:d>24000?24000:d
    if(isFinite(d)){ EQspec.efreq = d }
    cefreq = hztostr(d)

    d = cbands
    while(d.length && (!isFinite(d.substr(-1))) ) d=d.slice(0,-1)
    d=d*1;d=d<1?1:d>15?15:d
    if(isFinite(d)){ EQspec.nfreq = d }
    cbands=bntostr(EQspec.nfreq)
    setglobs()
    
    m.mount(equalel, {
      view: function () { return m( mc_eqlzr, {mdl:EQspec} ) }
    })
  }

  function bntostr(c){ return c+" Bands" }
  function hztostr(c){
    if(c>1000){ c=Math.round(c) ; c=c/1000+"KHz" }else{ c+="Hz" }
    return c 
  }
  
  function strtohz(c){
    c=c.toLowerCase()
    if(c.substr(-1)==="z") c=c.slice(0,-1)
    if(c.substr(-1)==="h") c=c.slice(0,-1)
    if(c.substr(-1)==="k"){ c=c.slice(0,-1);c*=1000 }
    return c*1
  }
  
  function chkbx(c){
    EQspec.linear=c
    console.log(c)
    submit()
  }
  
  return {
    view: function() {

      return m("form.place-qw",{onsubmit:submit},[
      
      m("fieldset.flex.four",[
       m("input", {
         type:"submit",tabindex:"-1"
        ,style:"position: absolute; left: -9999px; width: 1px; height: 1px;"
        ,onsubmit:submit
       }
       )
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cafreq=v}),
       value: cafreq
       }
       ))
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cefreq=v}),
       value: cefreq
       }
       ))
       ,
       m("label",m("input",
       {
       oninput: m.withAttr("value", v=>{cbands=v}),
       value: cbands
       }
       ))
      ,m("label",{style:"padding:0.3em 0.5em;"},[
        m("input[type=checkbox]",{
          onclick: m.withAttr("checked", chkbx)
         ,checked:EQspec.linear
          })
       ,m("span.checkable","Linear")
       ]) 
      ])
     ]) 
    }
  }
}

function bellbutton(vnode){
  
  var frqs = vnode.attrs.frqs
  var ky=vnode.attrs.ky
  
  function onclick(event){
    event.preventDefault()
    playztone(ky)
  }
  
  return{
    view: function(vnode) {
      return m("svg[viewBox='0 0 100 100']", 
      { onclick:onclick,
        style:"width:1em; height:1em;"
      },
      [ 
      m("circle",{cx:"50%",cy:"50%",r:"39%",stroke:"#eee",fill:"#02b"}) ,
      m("polygon[points=25,10 25,90 95,50]",{stroke:"#eee",fill:"#e7b"})
      
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
    stateobj:pwrs 
   ,frqs:ceqmdl.frq 
   ,statekey:0
   ,onclickextra:playztone 
   ,min:cmin ,max:cmax ,steps:40
   ,elstyle:{ border:"0px dashed black",width:slength,height:swide,margin:"auto" }
   ,horizontal:false
   ,knobsize:"4.9%"
   ,knobcolor:"#02b"
   ,strokecolor:"dimgrey"
   ,knobstrokecolor:"#171757"
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
       makarr(nb, function(ti){ 
        
        return m("td", {className: "inpoo"},
          //~ m("label",
          m("input",
          {
          style:"padding:0.1em 0.1em; background-color:#59f; border-color:#0df; text-align:center" ,
          oninput: m.withAttr("value", v=>{frqs[ti]=v}) ,
          value: frqs[ti]
          }
          )
          //~ )
          
         )//m
        },this
       )//makarr 
      ), 
      
      //row of bells
      m("tr"
      ,makarr(nb, function(ti){ 
        
        return m("td", {className: "frqbell",style:"margin:auto; text-align:center;"},
          m( bellbutton, {ky:ti} )
         )//m
        },this
       )//makarr 
      ),

      //row of sliders 
      m("tr",
            
        makarr(nb, function(i){ //makarr - make array of len
          var adef = JSON.parse(JSON.stringify(slider_def))
          adef.stateobj=pwrs
          adef.statekey=i //hacky clone as defs are not read in order
          adef.onclickextra=playztone
          return m("td", {className: "frqcntrl",style:"margin:auto; text-align:center"},
                   m( levelsliderm, adef )
                 )//m
            },this) 
      )//,
      /*   //row of frequency adjust
      m("tr",
            
        makarr(nb, function(i){ //makarr - make array of len
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
