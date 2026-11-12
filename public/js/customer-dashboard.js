/* MEI One - Customer dashboard (single file).
   Load from customer dashboard HTML with:  <script src="/js/customer-dashboard.js"></script>
   (after /js/config.js). Includes Cancel and Resubmit buttons on "My Requests". */
(() => {
  "use strict";
  // Styles for the new request buttons (kept here so this is the only file to change).
  (function addStyles(){const s=document.createElement("style");s.textContent=".req-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.req-cancel{color:#b91c1c!important;border-color:#fecaca!important}";document.head.appendChild(s);})();

  const SIGNIN_PATH="/customer-signin.html";
  const GPS_TEXT="My current location (GPS)";
  const EXTERNAL_SERVICES={learn:"https://www.meidriveafrica.com"};
  const INSTANT_ESTIMATE_URL="https://auto-d.meipressgroup.com";
  const SERVICE_TEXT={accident_scene:"Help at the scene of a road vehicle accident: traffic control, scene clearing and photo documentation."};
  SERVICE_TEXT.accident=SERVICE_TEXT.accident_scene;SERVICE_TEXT.accident_management=SERVICE_TEXT.accident_scene;

  // Sub-service choices used when the database has no rows in service_subservices for that service.
  const FALLBACK_SUBS={
    home:["Plumbing","Electrical","Cleaning","Carpentry & furniture repair","Painting & decorating","Appliance repair","Gardening & landscaping","Pest control","Moving & relocation","CCTV & security installation","Other home service"],
    towing:["Flatbed towing","Wheel-lift towing","Accident recovery","Off-road / ditch recovery","Motorbike towing","Heavy-duty (truck / bus) towing","Long-distance vehicle transport"],
    garage:["Routine servicing","Engine & mechanical repair","Brakes & suspension","Tyres, wheels & alignment","Battery & electrical","Air conditioning","Body work & painting","Diagnostics & inspection","Other garage service"],
    valuation:["Pre-purchase inspection","Valuation for sale","Insurance valuation","Bank / finance valuation","Accident / damage assessment","Other"],
    marketplace:["Vehicles","Spare parts & accessories","Electronics","Home & furniture","Fashion & beauty","Property (rent / sale)","Services & skills","Other"]
  };
  const META={
    rides:{icon:"🚘",name:"MEI Rides",text:"Convenient transport options for your everyday journeys."},
    delivery:{icon:"📦",name:"Delivery",text:"Move parcels, goods and essentials from one place to another."},
    towing:{icon:"🛻",name:"Towing",text:"Request vehicle recovery and towing assistance when needed."},
    roadside:{icon:"🧰",name:"Roadside Assistance",text:"Get help with unexpected vehicle trouble on the road."},
    accident_scene:{icon:"🚨",name:"Accident Scene Management",text:"Immediate help at the scene of a road accident — safety, towing and coordination."},
    garage:{icon:"🔧",name:"Garage Services",text:"Find garage services for vehicle repairs, maintenance and servicing."},
    valuation:{icon:"🚘",name:"Vehicle Valuation & Inspection",text:"Book a MEI One officer to inspect and value your vehicle on site, or get an instant online estimate for KES 100."},
    home:{icon:"🏠",name:"Home Services",text:"Find practical support for tasks around your home."},
    marketplace:{icon:"🛒",name:"Marketplace",text:"Discover products, offers and services in one place."},
    learn:{icon:"🎓",name:"Learning & Driver Training",text:"Build safer driving skills with MEI Drive Africa."}
  };
  const FORM_CONFIG={
    rides:{autoTitle:true,details:"Message to driver (optional)",detailsRequired:false,extras:[{id:"passengers",label:"Passengers",type:"number",min:1,max:8,value:1,required:true},{id:"when",label:"Pickup time",type:"select",options:["Now","Schedule for later"]},{id:"whenAt",label:"Date & time",type:"datetime-local",required:true,showIf:{id:"when",value:"Schedule for later"}}]},
    delivery:{autoTitle:true,details:"Item description",detailsHint:"What are we delivering?",extras:[{id:"size",label:"Package size",type:"select",options:["Small (envelope/parcel)","Medium (box)","Large (bulky)"]},{id:"recipient",label:"Recipient name",required:true},{id:"recipientPhone",label:"Recipient phone",type:"tel",required:true}]},
    towing:{autoTitle:true,subLabel:"Type of towing / recovery",subRequired:true,banner:{icon:"🚛",title:"MEI Towing",text:"Vehicle recovery and towing. Pick the type of help, tell us where the vehicle is and where it should go."},details:"What happened?",detailsHint:"Breakdown, accident, stuck, etc.",extras:[{id:"vehicle",label:"Vehicle make, model & plate",required:true},{id:"vehicleType",label:"Vehicle type",type:"select",required:true,options:["Saloon / hatchback","SUV / pickup","Matatu / van","Truck / bus","Motorbike / tuk-tuk"]},{id:"drivable",label:"Can the vehicle roll/steer?",type:"select",required:true,options:["Yes","No","Not sure"]},{id:"urgency",label:"How urgent?",type:"select",options:["Right now (emergency)","Within 1–2 hours","Scheduled for later"]},{id:"whenAt",label:"Date & time",type:"datetime-local",required:true,showIf:{id:"urgency",value:"Scheduled for later"}}]},
    roadside:{autoTitle:true,banner:{icon:"🛠️",title:"Roadside Assistance",text:"Help when you need it on the road. If you are in danger, move to safety and call 999 / 112."},details:"Anything else we should know? (optional)",detailsRequired:false,extras:[{id:"issue",label:"Problem",type:"select",required:true,options:["Flat tyre","Dead battery","Out of fuel","Locked out","Engine won't start","Overheating","Other"]},{id:"fuel",label:"Fuel type needed",type:"select",required:true,options:["Petrol","Diesel"],showIf:{id:"issue",value:"Out of fuel"}},{id:"vehicle",label:"Vehicle make, model & plate",required:true},{id:"safe",label:"Are you in a safe place?",type:"select",options:["Yes","Not sure","No (call 999 / 112)"]}]},
    garage:{autoTitle:true,subLabel:"What does the vehicle need?",subRequired:true,banner:{icon:"🔧",title:"Garage Services",text:"Repairs, maintenance and servicing. Choose the work needed and how you want it done."},details:"Describe the problem or work needed",detailsHint:"Symptoms, warning lights, noises, last service date, etc.",extras:[{id:"vehicle",label:"Vehicle make, model & plate",required:true},{id:"year",label:"Year of manufacture",type:"number",min:1980,max:2100},{id:"mileage",label:"Mileage (km, optional)",type:"number",min:0},{id:"mode",label:"How should the service happen?",type:"select",required:true,options:["I will bring it to the garage","Mobile mechanic to come to me","Pick up and return my vehicle"]},{id:"date",label:"Preferred date & time",type:"datetime-local"}]},
    accident_scene:{autoTitle:true,details:"What happened?",detailsHint:"Briefly describe the road accident. If anyone is injured, call 999 or 112 first.",extras:[{id:"help",label:"Help needed",type:"select",required:true,options:["Full scene management","Traffic control","Scene clearing","Photo documentation","Other"]},{id:"injuries",label:"Injuries",type:"select",required:true,options:["No injuries","Minor injuries","Serious injuries (call 999 / 112 first)"]},{id:"vehicles",label:"Vehicles involved",type:"number",min:1,max:20,value:1,required:true},{id:"vehicleTypes",label:"Vehicle types (car, matatu, truck, motorbike…)"},{id:"blocked",label:"Is the road blocked?",type:"select",options:["No","Partly","Fully"]},{id:"police",label:"Police informed?",type:"select",options:["Yes","No","Not sure"]},{id:"vehicle",label:"Your vehicle make, model & plate (optional)"}]},
    home:{subLabel:"What service do you need?",subRequired:true,banner:{icon:"🏠",title:"Home Services",text:"Connect with trusted service providers. Choose a service type below."},titleLabel:"What needs to be done?",titlePlaceholder:"e.g. Fix leaking kitchen tap",details:"Describe the work",detailsHint:"What needs fixing or doing? Mention sizes, quantities or any materials you already have.",extras:[{id:"urgency",label:"How urgent?",type:"select",required:true,options:["Emergency (today)","Within 2–3 days","This week","Flexible"]},{id:"property",label:"Property type",type:"select",options:["House","Apartment","Office","Shop / commercial","Other"]},{id:"date",label:"Preferred date & time",type:"datetime-local"},{id:"access",label:"Access instructions (gate, floor, contact on site)",full:true}]},
    marketplace:{subLabel:"Category",subRequired:true,banner:{icon:"🛍️",title:"MEI Marketplace",text:"Buy and sell through MEI One. Tell us what you want to buy, sell or find."},titleLabel:"Item / listing name",titlePlaceholder:"e.g. Toyota Axio 2014 or brake pads for Probox",details:"Describe the item or what you are looking for",detailsHint:"Brand, model, size, year, condition, any important details.",extras:[{id:"intent",label:"I want to",type:"select",required:true,options:["Buy","Sell","Rent","Find / enquire"]},{id:"price",label:"Budget / asking price (KES)",type:"number",min:0},{id:"condition",label:"Condition",type:"select",options:["New","Used - like new","Used - fair","Not applicable"]},{id:"qty",label:"Quantity",type:"number",min:1,max:1000,value:1}]},
    valuation:{autoTitle:true,subLabel:"Purpose of the valuation",subRequired:true,banner:{icon:"🚘",title:"On-site valuation & inspection",text:"A MEI One officer will come to the vehicle, inspect it and issue a signed report. Just need a rough figure? An instant estimate is available for KES 100.",link:{href:INSTANT_ESTIMATE_URL,label:"Get an instant estimate (KES 100) ↗"}},details:"Anything the officer should know (optional)",detailsHint:"Known damage, modifications, service history, who will be present, etc.",detailsRequired:false,extras:[{id:"vehicle",label:"Vehicle make, model & plate",required:true},{id:"year",label:"Year of manufacture",type:"number",min:1980,max:2100,required:true},{id:"mileage",label:"Mileage (km, optional)",type:"number",min:0},{id:"date",label:"Preferred date & time",type:"datetime-local",required:true}]},
    default:{details:"Description / instructions",detailsHint:"Describe what you need.",extras:[]}
  };
  FORM_CONFIG.accident=FORM_CONFIG.accident_scene;FORM_CONFIG.accident_management=FORM_CONFIG.accident_scene;
  const LOC_CONFIG={
    rides:{from:{title:"Pickup",mode:"place",main:"Pickup point",gps:true},to:{title:"Destination",mode:"place",main:"Where to?"}},
    delivery:{from:{title:"Pickup (collect the item from)",mode:"place",main:"Pickup point",gps:true},to:{title:"Delivery address",mode:"address",main:"Street / road"}},
    towing:{from:{title:"Where is the vehicle?",mode:"point",main:"Road / place",gps:true},to:{title:"Tow destination (garage or address)",mode:"place",main:"Garage / street"}},
    roadside:{from:{title:"Where are you?",mode:"point",main:"Road / place",gps:true}},
    accident_scene:{from:{title:"Road accident location",mode:"point",main:"Road / junction",gps:true}},
    home:{from:{title:"Service address",mode:"address",main:"Street / road",gps:true}},
    garage:{from:{title:"Where is the vehicle?",mode:"place",main:"Road / place",gps:true}},
    marketplace:{from:{title:"Item location / meeting point",mode:"place",main:"Area / street",gps:true}},
    valuation:{from:{title:"Where is the vehicle?",mode:"place",main:"Road / place",gps:true}},
    default:{from:{title:"Service location",mode:"address",main:"Street / road",gps:true}}
  };
  LOC_CONFIG.accident=LOC_CONFIG.accident_scene;LOC_CONFIG.accident_management=LOC_CONFIG.accident_scene;
  const $=id=>document.getElementById(id);
  let sb=null,currentUser=null,currentProfile=null,services=[],subservices=[],realtimeChannel=null,authSubscription=null,pollTimer=null,reloadTimer=null,redirecting=false,submitting=false,geo={from:null},autoTitleValue="";
  function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);}
  function message(id,text,type="info"){const el=$(id);if(el){el.textContent=text;el.className="message show "+type;}}
  function clearMessage(id){const el=$(id);if(el){el.textContent="";el.className="message";}}
  function dateText(value){if(!value)return"Date unavailable";const d=new Date(value);return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleString();}
  function serviceCode(service){return String(service?.service_code||"").trim().toLowerCase();}
  // Effective service key. An "auto" row that is really the garage service is treated as "garage" for forms and display.
  function svcKey(service){const raw=serviceCode(service);if(raw==="auto"){const text=(service?.service_name||"")+" "+(service?.description||"");if(/garage|repair|maintenance|servic/i.test(text)&&!/valuat|inspect|auto-d/i.test(text))return"garage";}return raw;}
  const ORDER=["rides","delivery","towing","roadside","accident_scene","garage","valuation","home","marketplace","learn"];
  // Guarantees all ten MEI One services show, even if a row is missing or inactive in the database.
  function ensureAllServices(list){const rows=list.slice();const have=new Set(rows.map(r=>cfgKey(svcKey(r))));ORDER.forEach(key=>{if(have.has(key))return;const m=META[key];rows.push({id:"builtin:"+key,service_code:key,service_name:m.name,description:m.text,icon:m.icon,is_active:true,builtin:true});});const rank=r=>{const i=ORDER.indexOf(cfgKey(svcKey(r)));return i<0?99:i;};return rows.map((r,i)=>[r,i]).sort((a,b)=>rank(a[0])-rank(b[0])||a[1]-b[1]).map(x=>x[0]);}
  function findService(id){return services.find(s=>String(s.id)===String(id));}
  // Maps any service_code (e.g. "home_services", "mei_towing") to a form/location config key.
  function cfgKey(code){if(code==="auto")return"valuation";if(FORM_CONFIG[code]||META[code])return code;if(/valuat|auto-?d|inspect/.test(code))return"valuation";if(/learn|training|driving|drive.?africa/.test(code))return"learn";if(/garage|mechanic|auto.?repair/.test(code))return"garage";if(/accident/.test(code))return"accident_scene";if(/home/.test(code))return"home";if(/tow|recover/.test(code))return"towing";if(/road/.test(code))return"roadside";if(/market|shop/.test(code))return"marketplace";if(/ride|taxi/.test(code))return"rides";if(/deliver|courier|parcel/.test(code))return"delivery";return"default";}
  function externalUrl(code){if(EXTERNAL_SERVICES[code])return EXTERNAL_SERVICES[code];const key=cfgKey(code);return key==="learn"?EXTERNAL_SERVICES.learn:null;}
  function displayName(service){return META[cfgKey(svcKey(service))]?.name||service?.service_name||service?.service_code||"Service";}
  function formConfig(code){return FORM_CONFIG[cfgKey(code)];}
  function locSpec(code){return LOC_CONFIG[cfgKey(code)]||LOC_CONFIG.default;}
  // Database sub-services first; otherwise the built-in list for that service.
  function serviceSubservices(service){const rows=subservices.filter(row=>String(row.service_id)===String(service?.id));if(rows.length)return rows;const list=FALLBACK_SUBS[cfgKey(svcKey(service))]||[];return list.map(name=>({id:"fb:"+name,service_id:service?.id,subservice_name:name}));}
  function subserviceName(row){return row.subservice_name||row.subservice_code||"Service category";}

  // Location input and optional GPS capture.
  function locHTML(prefix,spec){
    const address=spec.mode==="address",showArea=spec.mode!=="point";
    const placeholder=spec.mode==="point"?"Road name, junction or landmark":"Street, road or place name";
    return `<h4>${escapeHTML(spec.title)}</h4>
      <div class="field full"><label for="${prefix}_main">${escapeHTML(spec.main)}</label><input id="${prefix}_main" maxlength="300" placeholder="${placeholder}" required></div>
      ${showArea?`<div class="field"><label for="${prefix}_estate">Estate / area${address?"":" (optional)"}</label><input id="${prefix}_estate" maxlength="150" placeholder="e.g. Kilimani, Green Estate" ${address?"required":""}></div><div class="field"><label for="${prefix}_house">House / building / gate no. (optional)</label><input id="${prefix}_house" maxlength="100" placeholder="e.g. House 12B, Block C"></div>`:""}
      <div class="field full"><label for="${prefix}_landmark">Nearest landmark (optional)</label><input id="${prefix}_landmark" maxlength="200" placeholder="e.g. opposite the petrol station"></div>
      ${spec.gps?`<div class="loc-gps"><button class="secondary-btn" id="${prefix}_gps" type="button">📍 Use my current location</button><span class="hint" id="${prefix}_gpsNote">GPS is optional. You can enter your address instead.</span></div>`:""}`;
  }
  function bindGps(prefix,key){
    const btn=$(prefix+"_gps");if(!btn)return;
    $(prefix+"_main").addEventListener("input",()=>{if($(prefix+"_main").value.trim()!==GPS_TEXT&&geo[key]){geo[key]=null;$(prefix+"_gpsNote").textContent="Address entered. GPS coordinates will be refreshed if available.";}});
    btn.addEventListener("click",()=>{
      const note=$(prefix+"_gpsNote");if(!navigator.geolocation){note.textContent="Location is not supported on this device. Enter the address instead.";return;}
      btn.disabled=true;note.textContent="Getting your location…";
      navigator.geolocation.getCurrentPosition(pos=>{geo[key]={lat:Number(pos.coords.latitude.toFixed(6)),lng:Number(pos.coords.longitude.toFixed(6))};if(!$(prefix+"_main").value.trim())$(prefix+"_main").value=GPS_TEXT;note.textContent="Location captured (±"+Math.round(pos.coords.accuracy)+" m). Add a landmark if helpful.";btn.disabled=false;},err=>{note.textContent=err.code===1?"Location permission denied. Enter the address instead.":"Could not get your location. Enter the address instead.";btn.disabled=false;},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
    });
  }
  function renderLocations(code){const cfg=locSpec(code);geo={from:null};$("locFrom").innerHTML=locHTML("lf",cfg.from);bindGps("lf","from");$("locTo").hidden=!cfg.to;$("locTo").innerHTML=cfg.to?locHTML("lt",cfg.to):"";}
  function locValue(prefix,id){return($(prefix+"_"+id)?.value||"").trim();}
  function composeLoc(prefix){const parts=[locValue(prefix,"main"),locValue(prefix,"estate"),locValue(prefix,"house")?"House/Bldg "+locValue(prefix,"house"):""].filter(Boolean);let result=parts.join(", ");const landmark=locValue(prefix,"landmark");if(landmark)result+=(result?" ":"")+"(near "+landmark+")";return result;}
  async function nominatim(query){try{const response=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ke&q="+encodeURIComponent(query),{headers:{Accept:"application/json"}});if(!response.ok)return null;const rows=await response.json();if(!rows?.[0])return null;const lat=Number(rows[0].lat),lng=Number(rows[0].lon);return Number.isFinite(lat)&&Number.isFinite(lng)?{lat:Number(lat.toFixed(6)),lng:Number(lng.toFixed(6))}:null;}catch(error){console.warn("Address geocoding unavailable:",error);return null;}}
  async function geocodeLoc(prefix){const main=locValue(prefix,"main");if(!main||main===GPS_TEXT)return null;const estate=locValue(prefix,"estate"),landmark=locValue(prefix,"landmark");const attempts=[[main,estate,landmark,"Kenya"],[main,estate,"Kenya"],[main,"Kenya"],[landmark,estate,"Kenya"],[estate,"Kenya"]];for(const parts of attempts){const query=parts.filter(Boolean).join(", ");if(!query||query==="Kenya")continue;const result=await nominatim(query);if(result)return result;}return null;}

  // ---- Matter details for vehicle services: customer type, who referred, who pays, supporting letter ----
  const MATTER_SERVICES=["valuation","garage","towing","roadside","accident_scene"];
  const LETTER_REQUIRED=["valuation","garage"]; // optional for emergency services (towing, roadside, accident scene)
  const DOC_BUCKET="request-documents",MAX_DOC_MB=5,MAX_DOCS=3,DOC_TYPES=["application/pdf","image/jpeg","image/png","image/webp"];
  const REFERRERS=[["self","Myself (no referral)"],["insurer","Insurance company"],["bank","Bank / financier"],["law","Law firm / advocate"],["employer","Employer / fleet manager"],["dealer","Dealer / garage"],["other","Other"]];
  const PAYERS={individual:[["self","Myself"],["insurer","Insurance company"],["bank","Bank / financier"],["employer","My employer"],["other","Other third party"]],corporate:[["company","My company"],["insurer","Insurance company"],["bank","Bank / financier"],["other","Other third party"]]};
  let matterType="individual",matterCode="";
  const matterApplies=code=>MATTER_SERVICES.includes(cfgKey(code));
  const labelOf=(list,value)=>(list.find(row=>row[0]===value)||[])[1]||"";
  const isFin=value=>value==="insurer"||value==="bank";
  function readPrefs(){try{return JSON.parse(localStorage.getItem("mei_matter_prefs")||"{}")||{};}catch{return {};}}
  function saveMatterPrefs(){try{if($("matterBlock").hidden)return;const prefs={type:matterType};if(matterType==="corporate")prefs.company=$("m_company").value.trim();localStorage.setItem("mei_matter_prefs",JSON.stringify(prefs));}catch{}}
  function renderMatter(code){
    const box=$("matterBlock");matterCode=cfgKey(code);
    if(!matterApplies(code)){box.hidden=true;box.innerHTML="";return;}
    const prefs=readPrefs();matterType=prefs.type==="corporate"?"corporate":"individual";
    const letterRequired=LETTER_REQUIRED.includes(matterCode);
    box.hidden=false;
    box.innerHTML=`<h4>Matter details</h4>
      <p class="hint matter-hint">Tell us who this job is for, who referred you and who is paying, so the right provider is matched and the right party is billed.</p>
      <div class="field full"><label>Requesting as</label><div class="sub-pills"><button type="button" class="sub-pill" data-mtype="individual" aria-pressed="false">👤 Individual</button><button type="button" class="sub-pill" data-mtype="corporate" aria-pressed="false">🏢 Corporate / company</button></div></div>
      <div class="mgrid" id="m_corp" hidden>
        <div class="field"><label for="m_company">Company / organisation name</label><input id="m_company" maxlength="150" placeholder="e.g. Acme Logistics Ltd"></div>
        <div class="field"><label for="m_contact">Contact person at the company</label><input id="m_contact" maxlength="120" placeholder="Name of person handling this job"></div>
        <div class="field"><label for="m_contactPhone">Contact person phone (optional)</label><input id="m_contactPhone" type="tel" maxlength="30" placeholder="+254 700 000 000"></div>
        <div class="field"><label for="m_kra">Company KRA PIN (optional)</label><input id="m_kra" maxlength="20" placeholder="e.g. P051234567A" autocomplete="off"></div>
        <div class="field full"><label for="m_lpo">LPO / job order number (optional)</label><input id="m_lpo" maxlength="60" placeholder="Your internal purchase or job order reference"></div>
      </div>
      <div class="mgrid">
        <div class="field"><label for="m_referrer">Who referred you?</label><select id="m_referrer" required>${REFERRERS.map(row=>`<option value="${row[0]}">${row[1]}</option>`).join("")}</select></div>
        <div class="field" id="w_m_referrerName" hidden><label for="m_referrerName">Name of referrer</label><input id="m_referrerName" maxlength="150" placeholder="e.g. insurer, bank or firm name"></div>
        <div class="field"><label for="m_payer">Who is paying?</label><select id="m_payer" required></select></div>
        <div class="field" id="w_m_payerName" hidden><label for="m_payerName">Name of payer</label><input id="m_payerName" maxlength="150" placeholder="e.g. insurer, bank or company name"></div>
      </div>
      <div class="mgrid" id="w_m_fin" hidden>
        <div class="field full"><label for="m_ref">Claim, policy or loan reference number</label><input id="m_ref" maxlength="80" placeholder="As shown on the insurer or bank letter" autocomplete="off"></div>
        <div class="field full"><label for="m_letter" id="m_letterLabel">Letter from the insurer or bank</label><input id="m_letter" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"><span class="hint">${letterRequired?"Required when an insurer or bank is involved. ":"Optional for this service, but have it ready for the provider. "}PDF or image, up to ${MAX_DOCS} files, ${MAX_DOC_MB} MB each.</span><ul class="file-list" id="m_files"></ul></div>
      </div>`;
    const sync=()=>{
      const corp=matterType==="corporate";
      box.querySelectorAll("[data-mtype]").forEach(button=>{const on=button.dataset.mtype===matterType;button.classList.toggle("on",on);button.setAttribute("aria-pressed",String(on));});
      $("m_corp").hidden=!corp;$("m_company").required=corp;$("m_contact").required=corp;
      const payer=$("m_payer");
      if(payer.dataset.type!==matterType){const previous=payer.value;payer.innerHTML=PAYERS[matterType].map(row=>`<option value="${row[0]}">${row[1]}</option>`).join("");payer.value=PAYERS[matterType].some(row=>row[0]===previous)?previous:PAYERS[matterType][0][0];payer.dataset.type=matterType;}
      const referrer=$("m_referrer").value,pay=payer.value,refNamed=referrer!=="self",payNamed=pay!=="self"&&pay!=="company",fin=isFin(referrer)||isFin(pay);
      $("w_m_referrerName").hidden=!refNamed;$("m_referrerName").required=refNamed;
      $("w_m_payerName").hidden=!payNamed;$("m_payerName").required=payNamed;
      $("w_m_fin").hidden=!fin;$("m_letter").required=fin&&letterRequired;
      $("m_letterLabel").textContent="Letter from the insurer or bank"+(letterRequired?"":" (optional)");
    };
    box.querySelectorAll("[data-mtype]").forEach(button=>button.addEventListener("click",()=>{matterType=button.dataset.mtype;sync();}));
    $("m_referrer").addEventListener("change",sync);$("m_payer").addEventListener("change",sync);
    $("m_letter").addEventListener("change",()=>{const list=$("m_files");list.innerHTML="";[...$("m_letter").files].forEach(file=>{const li=document.createElement("li"),tooBig=file.size>MAX_DOC_MB*1048576,badType=!DOC_TYPES.includes(file.type);li.textContent=file.name+" ("+(file.size/1048576).toFixed(1)+" MB)"+(tooBig?" – too large":badType?" – unsupported type":"");if(tooBig||badType)li.className="bad";list.appendChild(li);});});
    if(prefs.type==="corporate"&&prefs.company)$("m_company").value=prefs.company;
    sync();
  }
  // Validates the matter block and returns the detail lines and files to upload.
  function collectMatter(code){
    const out={lines:[],files:[],error:null};
    if(!matterApplies(code)||$("matterBlock").hidden)return out;
    const v=id=>($(id)?.value||"").trim(),fail=(id,text)=>{out.error={el:$(id),text};return out;};
    const corp=matterType==="corporate";
    out.lines.push("Customer type: "+(corp?"Corporate":"Individual"));
    if(corp){
      if(!v("m_company"))return fail("m_company","Please enter the company or organisation name.");
      if(!v("m_contact"))return fail("m_contact","Please enter the contact person at the company.");
      out.lines.push("Company: "+v("m_company"),"Company contact person: "+v("m_contact"));
      if(v("m_contactPhone"))out.lines.push("Company contact person phone: "+v("m_contactPhone"));
      if(v("m_kra"))out.lines.push("Company KRA PIN: "+v("m_kra"));
      if(v("m_lpo"))out.lines.push("LPO / job order no.: "+v("m_lpo"));
    }
    const referrer=v("m_referrer"),pay=v("m_payer");
    if(referrer!=="self"&&!v("m_referrerName"))return fail("m_referrerName","Please enter the name of who referred you.");
    if(pay!=="self"&&pay!=="company"&&!v("m_payerName"))return fail("m_payerName","Please enter the name of who is paying.");
    out.lines.push("Referred by: "+labelOf(REFERRERS,referrer)+(referrer!=="self"?" – "+v("m_referrerName"):""));
    out.lines.push("Payer: "+labelOf(PAYERS[matterType],pay)+(pay!=="self"&&pay!=="company"?" – "+v("m_payerName"):""));
    if(isFin(referrer)||isFin(pay)){
      if(v("m_ref"))out.lines.push("Claim / policy / loan ref: "+v("m_ref"));
      const files=[...($("m_letter").files||[])];
      if(!files.length&&LETTER_REQUIRED.includes(matterCode))return fail("m_letter","Please attach the letter from the insurer or bank.");
      if(files.length>MAX_DOCS)return fail("m_letter","You can attach up to "+MAX_DOCS+" files.");
      for(const file of files){
        if(file.size>MAX_DOC_MB*1048576)return fail("m_letter",file.name+" is larger than "+MAX_DOC_MB+" MB.");
        if(!DOC_TYPES.includes(file.type))return fail("m_letter",file.name+" must be a PDF or an image (JPG, PNG, WEBP).");
      }
      out.files=files;
      out.lines.push("Authorisation letter: "+(files.length?files.length+" file(s) attached ("+files.map(file=>file.name).join(", ")+")":"not attached"));
    }
    return out;
  }
  // Uploads to private storage under <user id>/<request id>/ and returns the stored paths.
  async function uploadMatterFiles(userId,requestId,files){
    const folder=userId+"/"+(requestId||("pending-"+Date.now())),done=[];
    for(let i=0;i<files.length;i++){
      const file=files[i],safe=file.name.replace(/[^\w.\-]+/g,"_").slice(-80),path=folder+"/"+(i+1)+"-"+safe;
      const {error}=await sb.storage.from(DOC_BUCKET).upload(path,file,{contentType:file.type||undefined,upsert:false});
      if(error){if(done.length){try{await sb.storage.from(DOC_BUCKET).remove(done);}catch{}}throw new Error("Could not upload \""+file.name+"\": "+error.message+". Check that the \""+DOC_BUCKET+"\" storage bucket exists and allows uploads from signed-in customers.");}
      done.push(path);
    }
    return done;
  }

  // Dynamic fields are generated from the selected service's configuration.
  function renderExtras(cfg){
    $("extraFields").innerHTML=(cfg.extras||[]).map(field=>{const id="x_"+field.id,required=field.required?"required":"";let control="";if(field.type==="select"){control=`<select id="${id}" ${required}><option value="">Choose an option</option>${(field.options||[]).map(option=>`<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("")}</select>`;}else{control=`<input id="${id}" type="${escapeHTML(field.type||"text")}" ${required} ${field.min!=null?`min="${field.min}"`:""} ${field.max!=null?`max="${field.max}"`:""} ${field.value!=null?`value="${field.value}"`:""} maxlength="200">`;}return `<div class="field ${field.full?"full":""}" data-extra="${escapeHTML(field.id)}" ${field.showIf?"hidden":""}><label for="${id}">${escapeHTML(field.label)}</label>${control}</div>`;}).join("");
    (cfg.extras||[]).filter(field=>field.showIf).forEach(field=>{const wrapper=document.querySelector(`[data-extra="${field.id}"]`),driver=$("x_"+field.showIf.id);if(!wrapper||!driver)return;const sync=()=>{wrapper.hidden=driver.value!==field.showIf.value;$("x_"+field.id).required=!wrapper.hidden&&!!field.required;};driver.addEventListener("change",sync);sync();});
  }
  function showTab(name){document.querySelectorAll(".tab").forEach(button=>button.classList.toggle("active",button.dataset.tab===name));document.querySelectorAll(".section").forEach(section=>section.classList.toggle("active",section.id==="section-"+name));window.scrollTo({top:0,behavior:"smooth"});if(name==="requests")loadRequests();}
  function requestsTabActive(){return $("section-requests").classList.contains("active");}
  function externalLink(code){const url=externalUrl(code);if(!url)return false;const win=window.open(url,"_blank","noopener,noreferrer");if(!win)window.location.href=url;return true;}

  // Authentication and customer profile.
  async function getVerifiedUser(){const {data,error}=await sb.auth.getUser();if(error)throw error;if(!data?.user?.id)throw new Error("Your sign-in session is no longer valid. Please sign in again.");return data.user;}
  async function initialize(){
    if(!window.supabase||!window.MEI_SUPABASE||typeof window.MEI_SUPABASE.from!=="function"){document.body.innerHTML='<main style="max-width:700px;margin:60px auto;padding:25px;font-family:Arial"><h2>MEI One configuration error</h2><p>Supabase did not initialize. Check the Supabase CDN and /js/config.js.</p></main>';return;}
    sb=window.MEI_SUPABASE;const {data:sessionData,error:sessionError}=await sb.auth.getSession();if(sessionError)throw sessionError;if(!sessionData?.session){window.location.replace(SIGNIN_PATH);return;}
    currentUser=await getVerifiedUser();
    const {data:profile,error:profileError}=await sb.from("profiles").select("id,full_name,phone,email,account_status").eq("id",currentUser.id).maybeSingle();
    if(profileError){console.error("Customer profile query failed:",profileError);throw new Error("Could not load your customer profile: "+profileError.message);}
    currentProfile=profile||{};
    const accountStatus=String(currentProfile.account_status||"active").trim().toLowerCase();
    if(accountStatus!=="active"){alert("Your account is not active. Please contact MEI One support.");await sb.auth.signOut();window.location.replace(SIGNIN_PATH);return;}
    renderProfile();await loadServices();await loadRequests(true);startRealtime();
    const {data:authData}=sb.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT"&&!redirecting){redirecting=true;window.location.replace(SIGNIN_PATH);}});authSubscription=authData?.subscription||null;
  }
  function renderProfile(){const name=currentProfile?.full_name||currentUser?.user_metadata?.full_name||currentUser?.user_metadata?.name||"Customer";$("welcomeName").textContent=name;$("headerUser").textContent="Hi, "+name.split(/\s+/)[0];$("profileName").textContent=name;$("profileEmail").textContent=currentProfile?.email||currentUser?.email||"—";$("profilePhone").textContent=currentProfile?.phone||currentUser?.phone||"Not provided";$("profileStatus").textContent=currentProfile?.account_status||"Active";}

  // Load active services and optional subservice categories.
  async function loadServices(){
    $("servicesGrid").innerHTML='<div class="loading">Loading services from database…</div>';clearMessage("serviceMessage");
    const {data,error}=await sb.from("services").select("id,service_code,service_name,description,icon,route,is_active,display_order,base_price,price_per_km,commission_pct").eq("is_active",true).order("display_order",{ascending:true});
    if(error){console.error("Services query failed:",error);$("servicesGrid").innerHTML='<div class="empty">Unable to load services: '+escapeHTML(error.message)+'</div>';return;}
    services=ensureAllServices(Array.isArray(data)?data:[]);await loadSubservices();populateServiceSelect();renderServices();
  }
  async function loadSubservices(){subservices=[];if(!services.length)return;const {data,error}=await sb.from("service_subservices").select("id,service_id,subservice_code,subservice_name,description,icon,is_active,display_order").eq("is_active",true).order("display_order",{ascending:true});if(error){console.warn("Subservice query failed:",error);message("serviceMessage","Main services loaded. Some service categories are temporarily unavailable.","info");return;}subservices=Array.isArray(data)?data:[];}
  function renderServices(){const query=$("serviceSearch").value.trim().toLowerCase();const visible=services.filter(service=>[displayName(service),service.service_name,service.service_code,service.description].join(" ").toLowerCase().includes(query));if(!visible.length){$("servicesGrid").innerHTML='<div class="empty">No services match your search.</div>';return;}
    $("servicesGrid").innerHTML=visible.map(service=>{const code=svcKey(service),meta=META[cfgKey(code)]||{},isExternal=!!externalUrl(code);return `<article class="service-card"><div class="service-icon">${escapeHTML(meta.icon||service.icon||"✦")}</div><h3>${escapeHTML(displayName(service))}</h3><p>${escapeHTML(meta.text||SERVICE_TEXT[code]||service.description||"Explore this MEI One service and submit a request.")}</p><div class="service-meta">${escapeHTML(code.toUpperCase())}</div><button class="primary-btn full-btn service-action" type="button" data-id="${escapeHTML(service.id)}">${isExternal?"Open service":"Request service"}</button></article>`;}).join("");
    document.querySelectorAll(".service-action").forEach(button=>button.addEventListener("click",()=>{const service=findService(button.dataset.id);if(!service)return;if(!externalLink(svcKey(service)))openRequestForm(service);}));
  }
  function populateServiceSelect(){const select=$("selectedService");const previous=select.value;select.innerHTML=services.filter(service=>!externalUrl(svcKey(service))).map(service=>`<option value="${escapeHTML(service.id)}">${escapeHTML(displayName(service))}</option>`).join("");if(services.some(service=>String(service.id)===previous))select.value=previous;select.disabled=!services.length;}
  // Reset first, then set the service selected on the service card.
  function openRequestForm(service){$("requestForm").reset();populateServiceSelect();$("selectedService").value=String(service.id);clearMessage("requestMessage");updateRequestFields();showTab("request");}

  // Keeps the title in sync with the chosen service type until the customer types their own.
  function syncTitle(service,cfg){
    const sub=$("subserviceField").hidden?"":($("selectedSubservice").value?$("selectedSubservice").selectedOptions[0].textContent.trim():"");
    const name=displayName(service);
    const next=cfg.autoTitle?(sub?name+" – "+sub:name+" request"):(sub&&!cfg.titlePlaceholder?sub+" – "+name:"");
    const input=$("requestTitle");
    if(cfg.autoTitle||input.value===""||input.value===autoTitleValue){input.value=next;autoTitleValue=next;}
  }
  function updateRequestFields(){
    const service=findService($("selectedService").value);
    if(!service){$("locFrom").innerHTML="";$("locTo").hidden=true;$("matterBlock").hidden=true;$("matterBlock").innerHTML="";$("extraFields").innerHTML="";$("svcBanner").hidden=true;return;}
    const code=svcKey(service),cfg=formConfig(code);autoTitleValue="";
    renderLocations(code);renderMatter(code);
    $("svcBanner").hidden=!cfg.banner;if(cfg.banner)$("svcBanner").innerHTML=`<div class="ic">${escapeHTML(cfg.banner.icon)}</div><div><strong>${escapeHTML(cfg.banner.title)}</strong><span>${escapeHTML(cfg.banner.text)}</span>${cfg.banner.link?`<a href="${escapeHTML(cfg.banner.link.href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:6px;font-weight:700">${escapeHTML(cfg.banner.link.label)}</a>`:""}</div>`;
    $("detailsLabel").textContent=cfg.details||"Description / instructions";$("detailsHint").textContent=cfg.detailsHint||"";$("requestDetails").placeholder=cfg.detailsHint||"";$("requestDetails").required=cfg.detailsRequired!==false;
    $("titleField").hidden=!!cfg.autoTitle;$("requestTitle").required=!cfg.autoTitle;$("titleLabel").textContent=cfg.titleLabel||"Request title";$("requestTitle").placeholder=cfg.titlePlaceholder||"Briefly describe what you need";
    renderExtras(cfg);
    const children=serviceSubservices(service),hasSubs=children.length>0;
    $("subserviceField").hidden=!hasSubs;$("subLabel").textContent=(cfg.subLabel||"Service category")+(cfg.subRequired?"":" (optional)");
    $("selectedSubservice").required=hasSubs&&!!cfg.subRequired;
    $("selectedSubservice").innerHTML=`<option value="">${cfg.subRequired?"Choose an option":"Choose a category (optional)"}</option>`+children.map(row=>`<option value="${escapeHTML(row.id)}">${escapeHTML(subserviceName(row))}</option>`).join("");
    $("subPills").hidden=!(hasSubs&&cfg.pills);
    $("subPills").innerHTML=cfg.pills?children.map(row=>`<button type="button" class="sub-pill" data-sub="${escapeHTML(row.id)}">${escapeHTML(subserviceName(row))}</button>`).join(""):"";
    $("subPills").querySelectorAll(".sub-pill").forEach(pill=>pill.addEventListener("click",()=>{$("selectedSubservice").value=pill.dataset.sub;onSubChange();}));
    syncTitle(service,cfg);
  }
  function onSubChange(){const service=findService($("selectedService").value);if(!service)return;const chosen=$("selectedSubservice").value;document.querySelectorAll(".sub-pill").forEach(pill=>pill.classList.toggle("on",pill.dataset.sub===chosen));syncTitle(service,formConfig(svcKey(service)));}

  // Submit one request using the authenticated user's UUID as user_id.
  async function submitRequest(event){
    event.preventDefault();if(submitting)return;clearMessage("requestMessage");
    const service=findService($("selectedService").value);if(!service){message("requestMessage","Please choose a valid service.","error");return;}
    const code=svcKey(service);if(externalUrl(code)){message("requestMessage","This service opens in its dedicated MEI platform.","info");return;}
    const cfg=formConfig(code),locCfg=locSpec(code),title=$("requestTitle").value.trim()||((service.service_name||"Service")+" request"),description=$("requestDetails").value.trim(),pickup=composeLoc("lf"),dropoff=locCfg.to?composeLoc("lt"):"",notes=$("requestNotes").value.trim();
    if(!$("subserviceField").hidden&&cfg.subRequired&&!$("selectedSubservice").value){message("requestMessage","Please choose "+(cfg.subLabel||"a service category").toLowerCase()+".","error");$("selectedSubservice").focus();return;}
    if(!pickup){message("requestMessage","Please enter the service location or pickup point.","error");$("lf_main").focus();return;}if(locCfg.to&&!dropoff){message("requestMessage","Please enter the destination.","error");$("lt_main").focus();return;}if(cfg.detailsRequired!==false&&!description){message("requestMessage","Please provide the required description.","error");$("requestDetails").focus();return;}
    const detailLines=[];if(!$("subserviceField").hidden&&$("selectedSubservice").value)detailLines.push((cfg.subLabel||"Category").replace(/\?$/,"")+": "+$("selectedSubservice").selectedOptions[0].textContent.trim());
    for(const field of cfg.extras||[]){const wrapper=document.querySelector(`[data-extra="${field.id}"]`);if(!wrapper||wrapper.hidden)continue;const control=$("x_"+field.id),value=String(control?.value||"").trim();if(field.required&&!value){message("requestMessage",field.label+" is required.","error");control?.focus();return;}if(value)detailLines.push(field.label+": "+value);}
    const matter=collectMatter(code);if(matter.error){message("requestMessage",matter.error.text,"error");matter.error.el?.focus();return;}detailLines.push(...matter.lines);
    const contactPhone=currentProfile?.phone||currentUser?.phone||"";if(contactPhone)detailLines.push("Customer contact phone: "+contactPhone);if(description){if(detailLines.length)detailLines.push("");detailLines.push(description);}const details=detailLines.join("\n");
    const btn=$("submitRequest");submitting=true;btn.disabled=true;
    try{
      let from=geo.from;if(!from){btn.textContent="Checking location…";from=await geocodeLoc("lf");}let to=null;if(locCfg.to){btn.textContent="Checking destination…";to=await geocodeLoc("lt");}
      btn.textContent="Verifying account…";const authenticatedUser=await getVerifiedUser();currentUser=authenticatedUser;
      const requestId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():null;let uploaded=[];
      if(matter.files.length){btn.textContent="Uploading documents…";uploaded=await uploadMatterFiles(authenticatedUser.id,requestId,matter.files);}
      const customerName=currentProfile?.full_name||authenticatedUser.user_metadata?.full_name||authenticatedUser.user_metadata?.name||"Customer";
      const payload={...(requestId?{id:requestId}:{}),user_id:authenticatedUser.id,service_id:service.builtin?null:service.id,request_type:code,service:code,status:"pending",provider_id:null,title,details:details||null,notes:notes||null,pickup,dropoff:dropoff||null,pickup_address:pickup,destination_address:dropoff||null,customer_name:customerName,latitude:from?.lat??null,longitude:from?.lng??null,dropoff_latitude:to?.lat??null,dropoff_longitude:to?.lng??null};
      btn.textContent="Submitting request…";const {data,error}=await sb.from("service_requests").insert(payload).select("id").single();
      if(error&&uploaded.length){try{await sb.storage.from(DOC_BUCKET).remove(uploaded);}catch{}}
      if(error){console.error("Customer request INSERT rejected:",{code:error.code,message:error.message,details:error.details,hint:error.hint,userId:authenticatedUser.id,payload});throw error;}
      message("requestMessage","Your request has been submitted successfully. MEI One will now look for an eligible provider.","success");
      saveMatterPrefs();$("requestForm").reset();updateRequestFields();await loadRequests(true);setTimeout(()=>showTab("requests"),900);
    }catch(error){console.error("Customer request submission failed:",error);let explanation=error?.message||"Unknown error";if(error?.code==="42501"||/row-level security/i.test(explanation))explanation+=" Check the INSERT policies on public.service_requests and confirm that user_id equals auth.uid().";if(service.builtin&&(error?.code==="23502"||error?.code==="23503"))explanation+=" The \""+displayName(service)+"\" service is not in the services table yet. Add it there (see the SQL provided).";if(error?.code==="42703"||/column .* does not exist/i.test(explanation))explanation+=" The submitted column names do not match the current database schema.";message("requestMessage","Could not submit your request: "+explanation,"error");}
    finally{submitting=false;btn.disabled=false;btn.textContent="Submit Service Request";}
  }

  // Customer request history. created_at is the stable sort field for all rows.
  async function loadRequests(silent=false){if(!currentUser||!sb)return;if(!silent)$("requestsList").innerHTML='<div class="loading">Loading your requests…</div>';clearMessage("requestsMessage");const {data,error}=await sb.from("service_requests").select("id,service_id,request_type,status,pickup_address,destination_address,notes,requested_at,accepted_at,started_at,completed_at,cancelled_at,service,title,details,pickup,dropoff,price,customer_name,created_at,latitude,longitude,dropoff_latitude,dropoff_longitude").eq("user_id",currentUser.id).order("created_at",{ascending:false}).limit(50);if(error){console.error("Customer request history query failed:",error);$("requestsList").innerHTML='<div class="empty">Unable to load your requests: '+escapeHTML(error.message)+'</div>';return;}renderRequests(data||[]);}
  function normalizedStatus(value){return String(value||"pending").trim().toLowerCase().replace(/\s+/g,"_");}
  function trackBanner(status){switch(status){case"pending":case"requested":return'<div class="track">⏳ Your request has been received and is awaiting provider assignment.</div>';case"accepted":return'<div class="track ok">✓ A provider has accepted your request.</div>';case"in_progress":return'<div class="track go">● Your service is in progress.</div>';case"completed":return'<div class="track done">✓ Your service has been completed.</div>';case"cancelled":return'<div class="track">This request has been cancelled.</div>';case"proposed":return'<div class="track">A provider has proposed a service arrangement. Check for updates.</div>';default:return"";}}

  // ---- Cancel and resubmit buttons on "My Requests" ----
  let requestCache=new Map();
  const CANCELLABLE=["pending","requested","proposed","accepted"],RESUBMITTABLE=["cancelled","completed"];
  function requestActions(request,status){
    const cancel=CANCELLABLE.includes(status),again=RESUBMITTABLE.includes(status);
    if(!cancel&&!again)return"";
    const id=escapeHTML(request.id);
    return `<div class="req-actions">${cancel?`<button class="secondary-btn req-cancel" type="button" data-id="${id}">Cancel request</button>`:""}${again?`<button class="primary-btn req-resubmit" type="button" data-id="${id}">Resubmit request</button>`:""}</div>`;
  }
  async function cancelRequest(id,btn){
    const row=requestCache.get(String(id)),status=normalizedStatus(row?.status);
    if(!window.confirm(status==="accepted"?"A provider has already accepted this request. Cancel it anyway?":"Cancel this request?"))return;
    btn.disabled=true;clearMessage("requestsMessage");
    try{
      // Preferred: database function. Falls back to a direct update if the function has not been created.
      let rpc=await sb.rpc("cancel_my_request",{p_request_id:id});
      if(rpc.error&&/PGRST202|42883|could not find the function/i.test((rpc.error.code||"")+" "+(rpc.error.message||""))){
        const {data,error}=await sb.from("service_requests").update({status:"cancelled",cancelled_at:new Date().toISOString()}).eq("id",id).eq("user_id",currentUser.id).in("status",CANCELLABLE).select("id");
        if(error)throw error;
        if(!data||!data.length)throw new Error("This request can no longer be cancelled. It may already be in progress.");
      }else if(rpc.error){throw rpc.error;}
      message("requestsMessage","Your request has been cancelled.","success");
    }catch(error){
      console.error("Cancel request failed:",error);
      message("requestsMessage","Could not cancel the request: "+(error?.message||"Unknown error"),"error");
    }finally{await loadRequests(true);}
  }
  async function resubmitRequest(id,btn){
    const old=requestCache.get(String(id));if(!old||submitting)return;
    if(!window.confirm("Submit this request again as a new request?"))return;
    submitting=true;btn.disabled=true;btn.textContent="Submitting…";clearMessage("requestsMessage");
    try{
      const user=await getVerifiedUser();currentUser=user;
      const newId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():null;
      const pickup=old.pickup||old.pickup_address||null,dropoff=old.dropoff||old.destination_address||null;
      const payload={...(newId?{id:newId}:{}),user_id:user.id,service_id:old.service_id??null,request_type:old.request_type||old.service,service:old.service||old.request_type,status:"pending",provider_id:null,title:old.title||"Service request",details:old.details||null,notes:old.notes||null,pickup,dropoff,pickup_address:pickup,destination_address:dropoff,customer_name:old.customer_name||currentProfile?.full_name||user.user_metadata?.full_name||"Customer",latitude:old.latitude??null,longitude:old.longitude??null,dropoff_latitude:old.dropoff_latitude??null,dropoff_longitude:old.dropoff_longitude??null};
      const {error}=await sb.from("service_requests").insert(payload);
      if(error)throw error;
      message("requestsMessage","Your request has been submitted again. MEI One will look for an eligible provider.","success");
    }catch(error){
      console.error("Resubmit request failed:",error);
      message("requestsMessage","Could not resubmit the request: "+(error?.message||"Unknown error"),"error");
    }finally{submitting=false;await loadRequests(true);}
  }

  function renderRequests(rows){requestCache=new Map(rows.map(r=>[String(r.id),r]));if(!rows.length){$("requestsList").innerHTML='<div class="empty"><strong>You have not submitted any requests yet.</strong><br>Explore the MEI One service catalogue to get started.</div>';return;}$("requestsList").innerHTML=rows.map(request=>{const service=findService(request.service_id),name=(service?displayName(service):"")||request.title||request.service||request.request_type||"Service request",status=normalizedStatus(request.status),pickup=request.pickup||request.pickup_address,dropoff=request.dropoff||request.destination_address,submitted=request.requested_at||request.created_at,price=request.price==null?"":`<p><strong>Price:</strong> KES ${Number(request.price).toLocaleString("en-KE")}</p>`;return `<article class="request-card"><div class="request-top"><div><h3>${escapeHTML(name)}</h3><p style="margin:0;color:var(--muted)">${escapeHTML(request.title||"Service request")}</p></div><span class="status ${escapeHTML(status)}">${escapeHTML(status.replace(/_/g," "))}</span></div>${trackBanner(status)}${request.details?`<p><strong>Details:</strong> ${escapeHTML(request.details)}</p>`:""}${pickup?`<p><strong>Service location / pickup:</strong> ${escapeHTML(pickup)}</p>`:""}${dropoff?`<p><strong>Destination:</strong> ${escapeHTML(dropoff)}</p>`:""}${request.notes?`<p><strong>Additional notes:</strong> ${escapeHTML(request.notes)}</p>`:""}${price}${requestActions(request,status)}<p style="font-size:11px;color:var(--muted);margin-top:13px">Submitted: ${escapeHTML(dateText(submitted))} · Reference: ${escapeHTML(String(request.id).split("-")[0])}</p></article>`;}).join("");}
  function scheduleReload(){clearTimeout(reloadTimer);reloadTimer=setTimeout(()=>{if(requestsTabActive())loadRequests(true);},500);}
  function startRealtime(){try{realtimeChannel=sb.channel("customer-requests-"+currentUser.id).on("postgres_changes",{event:"*",schema:"public",table:"service_requests",filter:"user_id=eq."+currentUser.id},scheduleReload).subscribe(status=>{if(status==="CHANNEL_ERROR"||status==="TIMED_OUT")console.warn("Customer request realtime unavailable; polling remains enabled.");});}catch(error){console.warn("Realtime unavailable; polling will be used:",error);}pollTimer=setInterval(()=>{if(!document.hidden&&requestsTabActive())loadRequests(true);},20000);}
  async function signOut(){const btn=$("logoutBtn");btn.disabled=true;btn.textContent="Signing out…";const {error}=await sb.auth.signOut();if(error){console.error("Sign-out failed:",error);btn.disabled=false;btn.textContent="Sign out";alert("Unable to sign out: "+error.message);return;}redirecting=true;window.location.replace(SIGNIN_PATH);}

  // Page events.
  document.querySelectorAll(".tab").forEach(button=>button.addEventListener("click",()=>showTab(button.dataset.tab)));
  $("requestForm").addEventListener("submit",submitRequest);
  $("requestsList").addEventListener("click",event=>{const c=event.target.closest(".req-cancel"),r=event.target.closest(".req-resubmit");if(c)cancelRequest(c.dataset.id,c);else if(r)resubmitRequest(r.dataset.id,r);});
  $("selectedService").addEventListener("change",()=>{clearMessage("requestMessage");updateRequestFields();});
  $("selectedSubservice").addEventListener("change",onSubChange);
  $("backToServices").addEventListener("click",()=>showTab("home"));
  $("refreshRequests").addEventListener("click",()=>loadRequests());
  $("refreshServices").addEventListener("click",()=>loadServices().catch(error=>{console.error(error);message("serviceMessage","Could not refresh services: "+(error.message||"Unknown error"),"error");}));
  $("serviceSearch").addEventListener("input",renderServices);
  $("logoutBtn").addEventListener("click",signOut);
  $("securityBtn").addEventListener("click",()=>window.location.href=SIGNIN_PATH);
  window.addEventListener("pagehide",()=>{if(authSubscription)authSubscription.unsubscribe();if(realtimeChannel&&sb)sb.removeChannel(realtimeChannel);clearInterval(pollTimer);clearTimeout(reloadTimer);});
  initialize().catch(error=>{console.error("Customer dashboard initialization failed:",error);alert("MEI One could not initialize your dashboard: "+(error?.message||"Unknown error"));});
})();
