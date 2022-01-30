import { useEffect, useState } from 'react';
import ReactMapGL,{Marker,Popup}from 'react-map-gl';
import RoomIcon from '@mui/icons-material/Room';
import StarIcon from '@mui/icons-material/Star';
import "./app.css";
import axios from "axios";
import {format} from "timeago.js";
import Register from "./components/Register";
import 'mapbox-gl/dist/mapbox-gl.css';
import Login from "./components/login";

function App() {
  const myStorage=window.localStorage;
   const [currentUsername,setCurrentUsername]=useState(myStorage.getItem("user"));
  const [pins,setPins] =useState([]);
  const [currentPlaceId,setCurrentPlaceId]=useState(null);
  const [newPlace,setNewPlace]=useState(null);
  const [title,setTitle]=useState(null);
  const [desc,setDesc]=useState(null);
  const [star,setStar]=useState(0);
  const [showRegister,setShowRegister]=useState(false);
  const [showLogin,setShowLogin]=useState(false);
  const [viewport, setViewport] = useState({
    width:"100vw",
    height: "100vh",
    latitude: 46,
    longitude: 17,
    zoom: 4
  });



  useEffect(()=>{
   const getPins=async()=>{
     try{
       const allPins=await axios.get("/pins");
       setPins(allPins.data);
     } catch(err){
       console.log(err);
     }
   };
   getPins();
  },[]);

  const handleMarkerClick=(id,lat,long)=>{
    setCurrentPlaceId(id);
    setViewport({
      ...viewport,latitude:lat,longitude:long
    });
  }
  const handleAddClick=(e)=>{
   const [long,lat]=e.lngLat;
   setNewPlace({
     lat,
     long,
   });
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();
    const newPin={
      username:currentUsername,
      title,
      desc,
      rating:star,
      lat:newPlace.lat,
      long:newPlace.long,
    };

    try{
    const res=await axios.post("/pins",newPin);
    setPins([...pins,res.data]);
    setNewPlace(null);
    }catch(err){
      console.log(err)
    }
  };

  const handleLogout=()=>{
    myStorage.removeItem("user");
    setCurrentUsername(null);
  };




  return (
    <div style={{height:"100vh",width:"100%"}}>
       <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
      width="100%"
      height="100%"
      onViewportChange={nextViewport => setViewport(nextViewport)}
      mapStyle="mapbox://styles/hrshh17/ckyx63hw4001o14s0nnt1y9fd"
      onDblClick={ currentUsername && handleAddClick}
      transitionDuration="200"
      >
        {pins.map(p=>(
        <>      
        <Marker 
        latitude={p.lat} 
        longitude={p.long} 
        offsetLeft={-viewport.zoom * 3.5} 
        offsetTop={-viewport.zoom * 7}
        >
      <RoomIcon 
      style={{
        fontSize:viewport.zoom * 7,
        color:currentUsername === p.username ? "tomato" :"slateblue",
        cursor:"pointer"
        }}
        onClick={()=>handleMarkerClick(p._id,p.lat,p.long)}
         />
        </Marker>
        {p._id === currentPlaceId && (
      
       <Popup
       key={p._id}
      latitude={p.lat}
      longitude={p.long}
      closeButton={true}
      closeOnClick={false}
      anchor="left" 
      onClose={()=>setCurrentPlaceId(null)}
      >
          <div className="card">
            <label>Place</label>
            <h4 className="place">{p.title}</h4>
            <label>Review</label>
            <p className="desc">{p.desc}</p>
            <label>Rating</label>
            <div className="stars">
            
        {Array(p.rating).fill(<StarIcon className="star"/>)}
             </div>
             <label>Information</label>
             <span className="username">Createdby <b>{p.username}</b></span>
             <span className="date">{format(p.createdAt)}</span>
           
        
          </div>
        </Popup>
        )}
      </>
            ))} 

{newPlace && (
  <>
  <Marker
  latitude={newPlace.lat}
  longitude={newPlace.long}
  offsetLeft={-3.5 * viewport.zoom}
  offsetTop={-7 * viewport.zoom}
>
  <RoomIcon
    style={{
      fontSize: 7 * viewport.zoom,
      color: "tomato",
      cursor: "pointer",
    }}
  />
</Marker>



<Popup
      latitude={newPlace.lat}
      longitude={newPlace.long}
      closeButton={true}
      closeOnClick={false}
      anchor="left" 
      onClose={()=>setNewPlace(null)}
      >
       <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input
                    placeholder="Enter a title"
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label>Description</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    Add Pin
                  </button>
                </form>
              </div>
          
        </Popup>
        </>
        )}
        {currentUsername ?( <button className="button logout" onClick={handleLogout}>Logout</button>):(  <div className='buttons'>
       <button className='button login' onClick={()=>setShowLogin(true)}>Login</button>
       <button className="button register" onClick={()=>setShowRegister(true)}>Register</button>
     </div>
       )}
      
       {showRegister &&( <Register setShowRegister={setShowRegister}/>)}
     {showLogin && (<Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUsername={setCurrentUsername}/>)}
        </ReactMapGL>

    </div>
  );
}

export default App;
