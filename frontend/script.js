
const [notes, setNotes] = useState([]);

const fetchdata = async () => {
    const {data} = await axios.get("http://localhost:4000/api/tasks");
    setNotes(data);
}

useEffect(()=>{
    fetchdata();
},[])