import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,ActivityIndicator,Alert,KeyboardAvoidingView,Platform,ScrollView,Text,TextInput,TouchableOpacity,View,useWindowDimensions} from 'react-native';
import {router} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const API=process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/,'');
const C={bg:'#070A10',panel:'#101622',panel2:'#1B2333',stroke:'#3B4559',gold:'#F6C75D',violet:'#A25AFF',cyan:'#4CE5EF',white:'#F6F8FC',muted:'#A5B1C7',green:'#7FE6B6'};
type User={id:string;email:string;name:string};
type Tab='home'|'player'|'collection'|'budget'|'trade'|'settings';
type Tracker={skins:string[];ownedDiamonds:string;targetDiamonds:string;magicPoints:string;notes:string};
const initial:Tracker={skins:[],ownedDiamonds:'0',targetDiamonds:'1000',magicPoints:'0',notes:''};
const authKey='mythichub_auth_token';
const txt=(size=14,color=C.white,weight:'400'|'500'|'600'|'700'|'800'|'900'='400')=>({fontSize:size,color,fontWeight:weight} as const);
const inputStyle={backgroundColor:C.panel2,borderWidth:1,borderColor:C.stroke,borderRadius:2,padding:15,color:C.white,marginTop:8} as const;
async function readToken(){return Platform.OS==='web'?null:SecureStore.getItemAsync(authKey)}
async function writeToken(value:string|null){if(Platform.OS==='web')return;if(value)await SecureStore.setItemAsync(authKey,value);else await SecureStore.deleteItemAsync(authKey)}
async function request(path:string,method='GET',body?:object,token?:string|null){
 if(!API)throw new Error('Set EXPO_PUBLIC_API_URL in the root .env file');
 const response=await fetch(API+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},credentials:Platform.OS==='web'?'include':'omit',body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data?.message??data?.error?.message??data?.error??'Request failed ('+response.status+')');
 return {data,response};
}
const panel=(extra:object={})=>({backgroundColor:C.panel,borderWidth:1,borderColor:C.stroke,borderRadius:3,padding:20,...extra});
function Chip({children,color=C.violet}:{children:React.ReactNode;color?:string}){return <View style={{backgroundColor:color+'1C',borderColor:color+'55',borderWidth:1,paddingHorizontal:11,paddingVertical:7,borderRadius:2,alignSelf:'flex-start'}}><Text style={txt(11,color,'800')}>{children}</Text></View>}
function Action({title,onPress,subtle=false,disabled=false}:{title:string;onPress:()=>void;subtle?:boolean;disabled?:boolean}){return <TouchableOpacity onPress={onPress} disabled={disabled} style={{paddingHorizontal:18,paddingVertical:15,backgroundColor:subtle?C.panel2:C.violet,borderRadius:2,alignItems:'center',borderWidth:subtle?1:0,borderColor:C.stroke,opacity:disabled?.5:1,marginTop:10}}><Text style={txt(13,subtle?C.white:C.bg,'900')}>{title}</Text></TouchableOpacity>}
function Field({label,value,onChange,placeholder,number=false,secure=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;number?:boolean;secure?:boolean}){return <View style={{marginTop:16}}><Text style={txt(12,C.muted,'700')}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#6C7D9F" keyboardType={number?'number-pad':'default'} secureTextEntry={secure} autoCapitalize={secure?'none':'sentences'} style={inputStyle}/></View>}
export default function Home(){
 const {width}=useWindowDimensions(),wide=width>=880;
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[token,setToken]=useState<string|null>(null);
 const [mode,setMode]=useState<'signIn'|'signUp'>('signIn'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
 const [tab,setTab]=useState<Tab>('home'),fade=useRef(new Animated.Value(1)).current,slide=useRef(new Animated.Value(0)).current,glow=useRef(new Animated.Value(0)).current,[playerId,setPlayerId]=useState(''),[serverId,setServerId]=useState(''),[nickname,setNickname]=useState(''),[linked,setLinked]=useState(false);
 const [lookupStatus,setLookupStatus]=useState(''),[lookupName,setLookupName]=useState<string|null>(null),[tracker,setTracker]=useState<Tracker>(initial),[trackerReady,setTrackerReady]=useState(false),[skinDraft,setSkinDraft]=useState('');
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(glow,{toValue:1,duration:2400,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(glow,{toValue:0,duration:2400,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop()},[glow]);
 const notify=(title:string,message:string)=>Platform.OS==='web'?window.alert(title+': '+message):Alert.alert(title,message);
 useEffect(()=>{let active=true;(async()=>{try{const stored=await readToken();const {data}=await request('/api/auth/get-session','GET',undefined,stored);if(active){setToken(stored);setUser(data?.user??null)}}catch{}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 useEffect(()=>{if(!user){setTrackerReady(false);return;}let active=true;request('/api/profile','GET',undefined,token).then(({data})=>{if(!active)return;const p=data.profile;if(p){setPlayerId(p.playerId);setServerId(p.serverId);setNickname(p.nickname??'');setLinked(true)}else{setLinked(false);setPlayerId('');setServerId('');setNickname('')}}).catch(()=>{});AsyncStorage.getItem('mythichub:tracker:'+user.id).then(v=>{if(active){if(v){try{const parsed=JSON.parse(v);setTracker({...initial,...parsed,skins:Array.isArray(parsed.skins)?parsed.skins:[]})}catch{setTracker(initial)}}else setTracker(initial);setTrackerReady(true)}}).catch(()=>{if(active)setTrackerReady(true)});return()=>{active=false}},[user?.id,token]);
 useEffect(()=>{if(user&&trackerReady)AsyncStorage.setItem('mythichub:tracker:'+user.id,JSON.stringify(tracker)).catch(()=>{})},[tracker,user?.id,trackerReady]);
 async function authenticate(){if(!email.trim()||password.length<8||mode==='signUp'&&!name.trim()){notify('Check details','Enter email, password (at least 8 characters), and a name for sign up.');return}setBusy(true);try{const {data,response}=await request('/api/auth/'+(mode==='signIn'?'sign-in/email':'sign-up/email'),'POST',mode==='signIn'?{email:email.trim(),password}:{name:name.trim(),email:email.trim(),password});const bearer=response.headers.get('set-auth-token');if(Platform.OS!=='web'&&!bearer)throw new Error('Authentication token missing');await writeToken(bearer);setToken(bearer);setUser(data.user??null);setPassword('')}catch(e){notify('Authentication failed',e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function updatePlayerId(v:string){const m=v.trim().match(/^(\d{5,15})\s*\(\s*(\d{3,8})\s*\)$/);if(m){setPlayerId(m[1]);setServerId(m[2])}else setPlayerId(v);setLookupName(null);setLookupStatus('')}
 async function lookup(){if(!/^\d{5,15}$/.test(playerId.trim())||!/^\d{3,8}$/.test(serverId.trim())){notify('Check IDs','Enter valid Player and Zone IDs.');return}setBusy(true);setLookupStatus('Looking up nickname…');setLookupName(null);try{const {data}=await request('/api/mlbb/lookup?playerId='+encodeURIComponent(playerId.trim())+'&serverId='+encodeURIComponent(serverId.trim()),'GET',undefined,token);if(data?.nickname){setLookupName(data.nickname);setLookupStatus('Nickname found. Confirm below.')}else setLookupStatus(data?.message??'Lookup is unavailable. You can still save your IDs.')}catch(e){setLookupStatus(e instanceof Error?e.message:'Lookup unavailable. You can still save your IDs.')}finally{setBusy(false)}}
 async function save(){if(!/^\d{5,15}$/.test(playerId.trim())||!/^\d{3,8}$/.test(serverId.trim())){notify('Invalid IDs','Player ID must be 5–15 digits and Zone ID 3–8 digits.');return}setBusy(true);try{await request('/api/profile','PUT',{playerId:playerId.trim(),serverId:serverId.trim(),nickname:nickname.trim().slice(0,40)},token);setLinked(true);notify('Profile saved','Your MLBB identifiers were saved privately. Ownership remains unverified.')}catch(e){notify('Save failed',e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 async function signOut(){setBusy(true);try{await request('/api/auth/sign-out','POST',{},token)}catch{}finally{await writeToken(null);setToken(null);setUser(null);setTracker(initial);setTab('home');setBusy(false)}}
 const update=(key:keyof Tracker,value:string)=>setTracker(p=>({...p,[key]:value}));
 function switchTab(next:Tab){if(next===tab)return;fade.setValue(0);slide.setValue(12);setTab(next);Animated.parallel([Animated.timing(fade,{toValue:1,duration:230,easing:Easing.out(Easing.cubic),useNativeDriver:true}),Animated.timing(slide,{toValue:0,duration:260,easing:Easing.out(Easing.cubic),useNativeDriver:true})]).start()}
 const nav:[Tab,React.ComponentProps<typeof Ionicons>['name'],string][]=[['home','grid-outline','Dashboard'],['player','game-controller-outline','My Player'],['collection','albums-outline','Collection'],['budget','diamond-outline','Diamond Vault'],['trade','shield-checkmark-outline','Secure Trade'],['settings','settings-outline','Settings']];
 const shell=(children:React.ReactNode)=><View style={{maxWidth:1220,width:'100%',alignSelf:'center',paddingHorizontal:wide?28:17}}>{children}</View>;
 const sectionTitle=(title:string,desc:string)=><View style={{marginBottom:22}}><Text style={txt(wide?29:25,C.white,'900')}>{title}</Text><Text style={{...txt(13,C.muted),marginTop:7,lineHeight:21}}>{desc}</Text></View>;
 const metric=(icon:React.ComponentProps<typeof Ionicons>['name'],value:string,label:string,accent:string)=><View style={{...panel({flex:1,minWidth:wide?180:135,padding:17}),marginRight:10,marginBottom:10}}><Ionicons name={icon} size={26} color={accent}/><Text style={{...txt(24,C.white,'900'),marginTop:12}}>{value}</Text><Text style={{...txt(11,C.muted,'600'),marginTop:5}}>{label}</Text></View>;
 const goal=Math.max(1,Number(tracker.targetDiamonds)||1),owned=Math.max(0,Number(tracker.ownedDiamonds)||0),progress=Math.min(100,Math.round(owned/goal*100));
 return <KeyboardAvoidingView style={{flex:1,backgroundColor:C.bg}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,paddingBottom:50}}>
  <View style={{height:4,flexDirection:'row',backgroundColor:C.violet}}><View style={{width:'24%',backgroundColor:C.gold}}/><View style={{width:'14%',backgroundColor:C.cyan}}/></View>
  {loading?<View style={{paddingTop:160}}><ActivityIndicator color={C.violet}/></View>:!API?<View style={{padding:28,marginTop:60}}><Text style={txt(22,C.white,'800')}>Backend setup required</Text><Text style={txt(14,C.muted)}>Set EXPO_PUBLIC_API_URL in the root .env file and restart Expo.</Text></View>:!user?
  shell(<View style={{maxWidth:460,width:'100%',alignSelf:'center',paddingTop:wide?110:65}}>
   <View style={{alignItems:'center',marginBottom:33}}><View style={{flexDirection:'row',alignItems:'center',gap:12}}><MaterialCommunityIcons name="controller-classic" size={35} color={C.gold}/><Text style={txt(35,C.gold,'900')}>MYTHICHUB</Text></View><Text style={{...txt(11,C.muted,'800'),letterSpacing:3,marginTop:9}}>YOUR GAMING SANCTUARY</Text></View>
   <View style={panel({padding:wide?32:22})}><Chip>✦ PRIVATE PLAYER SPACE</Chip><Text style={{...txt(28,C.white,'900'),marginTop:20}}>{mode==='signIn'?'Welcome back, legend.':'Join the lounge.'}</Text><Text style={{...txt(13,C.muted),marginTop:7,lineHeight:20}}>Your progress, collections, and account details stay in your own space.</Text>
    {mode==='signUp'?<Field label="DISPLAY NAME" value={name} onChange={setName} placeholder="Your gamer name"/>:null}
    <Field label="EMAIL ADDRESS" value={email} onChange={setEmail} placeholder="you@example.com"/>
    <Field label="PASSWORD" value={password} onChange={setPassword} placeholder="At least 8 characters" secure/>
    <Action title={busy?'Please wait…':mode==='signIn'?'Enter MythicHub →':'Create account →'} onPress={authenticate} disabled={busy}/>
    <Action title={mode==='signIn'?'New here? Create an account':'Already a member? Sign in'} subtle onPress={()=>setMode(mode==='signIn'?'signUp':'signIn')}/>
   </View><Text style={{...txt(11,C.muted),textAlign:'center',marginTop:18}}>Independent MLBB companion • No game password required</Text>
  </View>):
  <>
   <View style={{backgroundColor:'#0A1020',borderBottomWidth:1,borderBottomColor:C.stroke,paddingVertical:19}}>
    {shell(<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
     <View><View style={{flexDirection:'row',alignItems:'center',gap:12}}><Animated.View style={{opacity:glow.interpolate({inputRange:[0,1],outputRange:[0.55,1]}),transform:[{scale:glow.interpolate({inputRange:[0,1],outputRange:[0.94,1.09]})}]}}><MaterialCommunityIcons name="controller-classic" size={31} color={C.gold}/></Animated.View><Text style={txt(24,C.gold,'900')}>MYTHICHUB</Text></View><Text style={{...txt(10,C.muted,'800'),letterSpacing:2,marginTop:3}}>THE GAMING LOUNGE</Text></View>
     <View style={{flexDirection:'row',alignItems:'center',gap:9}}><Chip color={C.green}>● PRIVATE SPACE</Chip><TouchableOpacity onPress={()=>switchTab('settings')} style={{backgroundColor:C.panel2,padding:12,borderRadius:2}}><Text style={txt(14,C.gold,'900')}>{(user.name||'P').slice(0,1).toUpperCase()}</Text></TouchableOpacity></View>
    </View>)}
   </View>
   {shell(<View style={{flexDirection:'row',flexWrap:'wrap',gap:8,paddingVertical:17}}>{nav.map(([id,icon,label])=><TouchableOpacity key={id} onPress={()=>switchTab(id)} style={{backgroundColor:tab===id?C.violet:C.panel,borderWidth:1,borderColor:tab===id?C.violet:C.stroke,paddingHorizontal:wide?18:12,paddingVertical:12,borderRadius:2}}><View style={{flexDirection:'row',alignItems:'center',gap:9}}><Ionicons name={icon} size={17} color={tab===id?C.bg:C.cyan}/><Text style={txt(12,tab===id?C.bg:C.muted,'800')}>{label}</Text></View></TouchableOpacity>)}</View>)}
   {shell(<Animated.View style={{paddingTop:wide?20:8,opacity:fade,transform:[{translateY:slide}]}}>
    {tab==='home'?<>
     <View style={{...panel({padding:wide?30:21}),backgroundColor:'#19132F',borderColor:C.violet,marginBottom:20,overflow:'hidden'}}>
      <Chip color={C.gold}>⚡ GAMER COMMAND CENTER</Chip><Animated.View pointerEvents="none" style={{position:'absolute',right:22,top:20,opacity:glow.interpolate({inputRange:[0,1],outputRange:[0.14,0.38]}),transform:[{scale:glow.interpolate({inputRange:[0,1],outputRange:[0.94,1.08]})}]}}><MaterialCommunityIcons name="controller-classic" size={wide?160:90} color={C.violet}/></Animated.View><Text style={{...txt(wide?33:27,C.white,'900'),marginTop:15}}>Ready to climb, {user.name?.split(' ')[0]||'Legend'}?</Text><Text style={{...txt(14,C.muted),marginTop:9,maxWidth:590,lineHeight:23}}>Your command center for player identity, collections, diamond goals, and future top-ups. Built for players, not clutter.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:14}}><Action title="View my player →" onPress={()=>switchTab('player')}/><Action title="Explore top-ups ↗" subtle onPress={()=>router.push('/topup')}/></View>
     </View>
     <View style={{flexDirection:'row',flexWrap:'wrap'}}>{metric('game-controller-outline',linked?'Linked':'Not linked','MLBB account',C.cyan)}{metric('albums-outline',String(tracker.skins.length),'Skins tracked',C.violet)}{metric('diamond-outline',owned.toLocaleString(),'Diamonds logged',C.gold)}{metric('sparkles-outline',Math.min(100,Math.max(0,Number(tracker.magicPoints)||0))+'/100','Magic Wheel progress',C.green)}</View>
     <View style={{flexDirection:wide?'row':'column',gap:15,marginTop:10}}>
      <View style={panel({flex:1})}><Text style={txt(17,C.white,'900')}>◎ Player identity</Text><Text style={{...txt(13,C.muted),marginTop:9,lineHeight:21}}>{linked?'Saved Player ID: '+playerId+' ('+serverId+')':'Link your game account without needing nickname verification.'}</Text><Action title={linked?'Manage profile':'Link account'} subtle onPress={()=>switchTab('player')}/></View>
      <View style={panel({flex:1})}><Text style={txt(17,C.white,'900')}>◈ Diamond goal</Text><Text style={{...txt(13,C.muted),marginTop:9}}>{owned.toLocaleString()} / {goal.toLocaleString()} diamonds</Text><View style={{height:9,backgroundColor:C.panel2,borderRadius:10,marginTop:17,overflow:'hidden'}}><View style={{width:progress+'%',height:'100%',backgroundColor:C.violet,borderRadius:10}}/></View><Action title="Open vault" subtle onPress={()=>switchTab('budget')}/></View>
     </View>
    </>:null}
    {tab==='player'?<>
     {sectionTitle('Player command center','Link your MLBB account privately. Nickname lookup is optional while the provider is unavailable.')}
     <View style={panel({maxWidth:760})}><Chip color={linked?C.green:C.gold}>{linked?'● PROFILE SAVED':'○ NOT LINKED'}</Chip>
      <Field label="PLAYER ID" value={playerId} onChange={updatePlayerId} placeholder="123456789 or 123456789(5039)" number/>
      <Field label="SERVER / ZONE ID" value={serverId} onChange={v=>{setServerId(v);setLookupName(null)}} placeholder="5039" number/>
      <Action title={busy?'Checking…':'◎ Check nickname (optional)'} subtle disabled={busy} onPress={lookup}/>
      {lookupStatus?<Text style={{...txt(12,C.muted),marginTop:12,lineHeight:19}}>{lookupStatus}</Text>:null}
      {lookupName?<View style={{backgroundColor:C.panel2,padding:15,borderRadius:2,marginTop:12}}><Text style={txt(15,C.cyan,'800')}>{lookupName}</Text><Action title="Use this nickname" onPress={()=>{setNickname(lookupName);setLookupName(null);setLookupStatus('Nickname selected. This does not verify ownership.')}}/></View>:null}
      <Field label="IN-GAME NICKNAME (OPTIONAL)" value={nickname} onChange={setNickname} placeholder="Your in-game name"/>
      <Action title={busy?'Saving…':'Save my player profile'} onPress={save} disabled={busy}/>
      <Text style={{...txt(11,C.muted),marginTop:15,lineHeight:18}}>🔒 Saved to your authenticated profile. Player ID lookup does not establish MLBB account ownership.</Text>
     </View>
    </>:null}
    {tab==='collection'?<>
     {sectionTitle('Collection room','Track the skins you own. Entries are personal records, not verified game inventory.')}
     <View style={{flexDirection:wide?'row':'column',gap:16}}>
      <View style={panel({flex:1})}><Chip>✧ SKIN VAULT</Chip><Text style={{...txt(29,C.white,'900'),marginTop:15}}>{tracker.skins.length} skins</Text><Field label="ADD A SKIN" value={skinDraft} onChange={setSkinDraft} placeholder="e.g. Gusion — K'"/>
       <Action title="+ Add to collection" onPress={()=>{const v=skinDraft.trim();if(!v)return;if(tracker.skins.some(s=>s.toLowerCase()===v.toLowerCase())){notify('Already tracked','This skin is already in your collection.');return}setTracker(p=>({...p,skins:[...p.skins,v].slice(0,250)}));setSkinDraft('')}}/>
      </View>
      <View style={panel({flex:1.5})}><Text style={txt(17,C.white,'900')}>Your collection</Text>{tracker.skins.length===0?<Text style={{...txt(13,C.muted),marginTop:18,lineHeight:21}}>No skins logged yet. Add your favorites to start building your collection.</Text>:tracker.skins.map((s,i)=><View key={s+i} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:C.stroke,paddingVertical:13,gap:8}}><Text style={{...txt(13,C.white,'700'),flex:1}}>✧  {s}</Text><TouchableOpacity onPress={()=>setTracker(p=>({...p,skins:p.skins.filter((_,j)=>j!==i)}))}><Text style={txt(12,'#FFB0BA','800')}>Remove</Text></TouchableOpacity></View>)}</View>
     </View>
    </>:null}
    {tab==='budget'?<>
     {sectionTitle('Diamond vault','Plan your in-game spending and Magic Wheel progress. All values are manually tracked.')}
     <View style={{flexDirection:wide?'row':'column',gap:16}}>
      <View style={panel({flex:1})}><Chip color={C.gold}>◈ SAVINGS TRACKER</Chip><Field label="DIAMONDS CURRENTLY SAVED" value={tracker.ownedDiamonds} onChange={v=>update('ownedDiamonds',v.replace(/[^\d]/g,''))} number/><Field label="DIAMOND GOAL" value={tracker.targetDiamonds} onChange={v=>update('targetDiamonds',v.replace(/[^\d]/g,''))} number/><Text style={{...txt(15,C.white,'800'),marginTop:20}}>{progress}% of your goal</Text><View style={{height:12,backgroundColor:C.panel2,borderRadius:10,marginTop:12,overflow:'hidden'}}><View style={{height:'100%',width:progress+'%',backgroundColor:C.gold}}/></View><Text style={{...txt(12,C.muted),marginTop:11}}>{Math.max(0,goal-owned).toLocaleString()} diamonds to go</Text></View>
      <View style={panel({flex:1})}><Chip color={C.violet}>✦ MAGIC WHEEL</Chip><Text style={{...txt(13,C.muted),marginTop:18,lineHeight:21}}>Track your Magic Wheel points manually. This is not connected to the game.</Text><Field label="CURRENT POINTS (0–100)" value={tracker.magicPoints} onChange={v=>update('magicPoints',String(Math.min(100,Number(v.replace(/[^\d]/g,''))||0)))} number/><Text style={{...txt(27,C.violet,'900'),marginTop:20}}>{Math.min(100,Number(tracker.magicPoints)||0)} / 100</Text><View style={{height:12,backgroundColor:C.panel2,borderRadius:10,marginTop:12,overflow:'hidden'}}><View style={{height:'100%',width:Math.min(100,Number(tracker.magicPoints)||0)+'%',backgroundColor:C.violet}}/></View></View>
     </View>
     <View style={panel({marginTop:16})}><Text style={txt(16,C.white,'900')}>Personal notes</Text><Field label="REMINDERS / PLANS" value={tracker.notes} onChange={v=>update('notes',v.slice(0,500))} placeholder="Next skin to save for, event goals…"/><Text style={{...txt(11,C.muted),marginTop:10}}>Your tracker changes save automatically on this device, separated by your MythicHub account.</Text></View>
    </>:null}
    {tab==='trade'?<>
     {sectionTitle('SECURE TRADE // ESCROW LAB','A proposed protected trading workflow. No funds are accepted, held, or released by MythicHub yet.')}
     <View style={{...panel({marginBottom:18}),borderColor:C.violet}}><Chip color={C.gold}>⛨ PROTOTYPE • TRANSACTIONS DISABLED</Chip><Text style={{...txt(22,C.white,'900'),marginTop:18}}>Trade with safeguards. Not blind trust.</Text><Text style={{...txt(13,C.muted),marginTop:12,lineHeight:23}}>A legitimate escrow service would require verified participants, regulated payment custody through an authorized partner, independent payment confirmation, seller delivery evidence, buyer acceptance, dispute handling, and auditable release or refunds.</Text></View>
     <View style={{flexDirection:wide?'row':'column',gap:12}}>{[['01','Create trade','Buyer and seller agree on item, price and terms.'],['02','Secure payment','Authorized payment partner confirms funds. No receipt screenshots as proof.'],['03','Deliver & review','Seller fulfills; buyer confirms or raises a dispute.'],['04','Release or refund','Partner releases or refunds after policy-based resolution.']].map(([n,title,desc])=><View key={n} style={panel({flex:1})}><Text style={txt(22,C.violet,'900')}>{n}</Text><Text style={{...txt(16,C.white,'900'),marginTop:15}}>{title}</Text><Text style={{...txt(12,C.muted),marginTop:9,lineHeight:21}}>{desc}</Text></View>)}</View>
     <View style={panel({marginTop:16})}><Text style={txt(16,C.gold,'900')}>Protection is not a guarantee</Text><Text style={{...txt(12,C.muted),marginTop:10,lineHeight:21}}>Scams, stolen accounts, chargebacks and disputed delivery can still occur. MythicHub must not claim zero risk. Trade creation, deposits, escrow and payout are disabled pending legal, payment-provider and security review.</Text><Action title="Secure trades are not live yet" disabled onPress={()=>{}}/></View>
    </>:null}
    {tab==='settings'?<>
     {sectionTitle('Your account','A private space for your profile, session, and preferences.')}
     <View style={panel({maxWidth:700})}><Chip color={C.green}>● SIGNED IN</Chip><Text style={{...txt(22,C.white,'900'),marginTop:17}}>{user.name}</Text><Text style={{...txt(13,C.muted),marginTop:6}}>{user.email}</Text><View style={{height:1,backgroundColor:C.stroke,marginVertical:20}}/><Text style={txt(14,C.white,'800')}>Your data</Text><Text style={{...txt(12,C.muted),marginTop:9,lineHeight:21}}>MLBB identifiers are saved to your authenticated Neon profile. Collection and goal tracking currently use account-scoped storage on this device; they are not yet synced between devices.</Text><Action title="Manage player details" subtle onPress={()=>switchTab('player')}/><Action title="Sign out securely" onPress={signOut} disabled={busy}/></View>
    </>:null}
   </Animated.View>)}
   {shell(<View style={{borderTopWidth:1,borderColor:C.stroke,marginTop:60,paddingTop:22,alignItems:'center'}}><Text style={txt(11,C.muted)}>MYTHICHUB • AN INDEPENDENT GAMING COMPANION • NOT AFFILIATED WITH MOONTON</Text></View>)}
  </>}
 </ScrollView></KeyboardAvoidingView>
}
