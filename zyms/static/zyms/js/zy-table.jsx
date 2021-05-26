import styles from '../css/zy-table.cssm' assert {type: 'css'};
import {ShellContext, PouchDBContext, ModalContainer, ConstsContext} from "./context.js";
import {ModalDialog, ResetButton} from './components.jsx';
import AddDocForm from './add-doc-form.jsx';
import {getPages} from "./utils.js";

export default function ZYTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);
  const modalContainer = React.useContext(ModalContainer)
  const Consts = React.useContext(ConstsContext)

  const [docs, setDocs] = React.useState([]);
  const [addDoc, setAddDoc] = React.useState(false);
  const [editDoc, setEditDoc] = React.useState(null);
  const [size, setSize] = React.useState(50);
  const [skip, setSkip] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [navs, setNavs] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const [searchKey, setSearchKey] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [needSync, setNeedSync] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState(null);
  const [platformFilter, setPlatformFilter] = React.useState(null);

  React.useEffect(() => {
    let navs = [];
    for (let page=1;page<=pages;page++) {
      navs.push(<a key={page} className={`${currentPage === page && 'active'} item`} onClick={() => {
        if (currentPage === page) {
          return;
        }
        setCurrentPage(page);
      }}>{page}</a>)
    }
    setNavs(navs);
  }, [pages, currentPage])

  async function showDocs() {
    let result;

    if (search) {
      let filter = {
        selector: {
          $or: [{name: {$regex: new XRegExp(`(?i)${search}`)}}, {id: {$regex: new XRegExp(`(?i)${search}`)}}],
          category: {$gte: null},
          platform: {$gte: null},
          follow_number: {$gte: null},
        },
        sort: [{follow_number: 'desc'}],
        limit: size,
        skip
      }

      if (categoryFilter) {
        filter.selector.category = categoryFilter;
      }

      if (platformFilter) {
        filter.selector.platform = platformFilter;
      }

      result = await db.find(filter);
      result.total_rows = currentPage * size;
      if (size === result.docs.length) {
        result.total_rows += 1;
      } else {
        result.total_rows = (currentPage - 1) * size + result.docs.length;
      }
    } else {
      result = await db.allDocs({
        include_docs: true,
        limit: size,
        skip,
        startkey: 'data',
        endkey: 'data\ufff0'});
      result.total_rows -= 2+2; // 2 index and 2 consts
      result.total_rows = Math.max(0, result.total_rows);
      result.rows = result.rows.map(item=>{
        return {...item.doc, _id: item.id, _rev: item.value.rev};
      });
    }

    setTotal(result.total_rows);
    setPages(getPages(result.total_rows, size));
    setDocs(result.rows ?? result.docs);
    setNeedSync(false);
  }

  React.useEffect(()=>{
    setSkip((currentPage-1)*size)
  }, [currentPage]);

  React.useEffect(showDocs, [skip, search, platformFilter, categoryFilter]);

  React.useEffect(() => {
    let sync = db.changes({
      since: 'now',
      live: true
    }).on('change', () => {
      setNeedSync(true);
    });

    return () => {
      sync.cancel();
    }
  }, [])

  return <>
  {needSync && <div className="ui segment">
    <div className="ui message">
      <i className="close icon" onClick={() => setNeedSync(false)}></i>
      <div className="header">
        数据已更新，<a href="#" onClick={() => {
          showDocs();
          setNeedSync(false);
      }}>立即刷新</a>？
      </div>
      <p>检测到数据有更新，你可以选择立即刷新或者关闭消息。</p>
    </div>
  </div>}
  <div className="ui segment form">
    <div className="ui action input field">
      <input tabIndex="0" type="text" placeholder="Search..." value={searchKey}
             onChange={event => setSearchKey(event.target.value)}
             onKeyPress={event => {
               if (event.key === 'Enter') {
                 setSearch(searchKey);
                 setCurrentPage(1);
               }
             }}/>
      <button className="ui icon button" onClick={() => {
        setSearch(searchKey);
        setCurrentPage(1);
      }}>
        <i className="search icon"></i>
      </button>
    </div>
    <div className="inline fields">
    <label htmlFor="category">类别:</label>
      {Consts.category.map(item=>
    <div className="field" key={item}>
      <div className="ui radio checkbox">
        <input type="radio" name="category" checked={item === categoryFilter} value={item} readOnly className="hidden"/>
        <label onClick={()=>{
          setCategoryFilter(item)
        }}>{item}</label>
      </div>
    </div>)}
    <ResetButton onClick={()=>setCategoryFilter(null)}/>
    </div>

    <div className="inline fields">
    <label htmlFor="platform">平台:</label>
      {Consts.platform.map(item=>
    <div className="field" key={item}>
      <div className="ui radio checkbox">
        <input type="radio" name="platform" checked={item === platformFilter} value={item} readOnly className="hidden"/>
        <label onClick={()=>{
          setPlatformFilter(item)
        }}>{item}</label>
      </div>
    </div>)}
    <ResetButton onClick={()=>setPlatformFilter(null)}/>
    </div>

  </div>
  <div className="ui segment">
    { addDoc && <ModalDialog title={'添加资源'} body={<AddDocForm closeForm={() => setAddDoc(false)}/>} container={modalContainer} onClose={
        ()=>setAddDoc(false)
      } negative={false} showIcon={false} blurClose={false}/>}
      { editDoc && <ModalDialog title={'编辑资源'} body={<AddDocForm closeForm={(doc) => {
        for (let key in doc) {
          if (doc[key] !== docs[editDoc - 1][key]) {
            doc[`${key}_isEdit`] = true;
          }
        }
        doc.isEdit = true;

        docs[editDoc-1] = doc;
        setEditDoc(null);
      }} doc={docs[editDoc-1]}/>} container={modalContainer} onClose={
        ()=>setEditDoc(null)
      } negative={false} showIcon={false} blurClose={false}/>}
    <table className="ui selectable celled padded table">
  <thead>
    <tr><th>#</th>
    <th>平台</th>
    <th>账号名称</th>
    <th>ID/链接</th>
    <th>类别</th>
    <th>粉丝量</th>
    <th>粉丝活跃度</th>
    <th>账期</th>
    <th>付款形式</th>
    <th>供应商名称</th>
    <th>供应商账户</th>
    <th>操作</th>
  </tr></thead>
  <tbody>
  {docs.map((item, idx) =>
    <tr key={item._id} className={`${item.isEdit && 'positive'} ${item.isRemove && 'negative'}`}>
      <td className="center aligned">{skip+idx+1}</td>
      <td className="center aligned">{item.platform}</td>
      <td className="center aligned">{item.name}</td>
      <td className="center aligned">{item.id_isEdit && <i className="attention icon"></i>}{item.id}</td>
      <td className="center aligned">{item.category_isEdit && <i className="attention icon"></i>}{item.category}</td>
      <td className="center aligned">{item.follow_number_isEdit && <i className="attention icon"></i>}{item.follow_number}</td>
      <td className="center aligned">{item.activate_isEdit && <i className="attention icon"></i>}{item.activate}</td>
      <td className="center aligned">{item.accounting_period_isEdit && <i className="attention icon"></i>}{item.accounting_period}</td>
      <td className="center aligned">{item.pay_category_isEdit && <i className="attention icon"></i>}{item.pay_category}</td>
      <td className="center aligned">{item.vendor_isEdit && <i className="attention icon"></i>}{item.vendor}</td>
      <td>{item.vendor_account_isEdit && <i className="attention icon"></i>}{item.vendor_account}</td>
      <td className={`${item.isRemove && styles['operator-hide']} center aligned`}>
          <div className="ui small basic icon buttons">
            <button className="ui button" onClick={() => setEditDoc(idx+1) }><i className="edit icon"></i></button>
            <button className="ui button" onClick={() => {
              db.remove(item);
              item.isRemove = true;
              docs[idx] = item;
            }}><i className="remove icon"></i></button>
          </div>
      </td>
    </tr>)}
  </tbody>
  <tfoot>
    <tr><th colSpan="12"><div className="ui middle aligned two column grid">
      <div className="left floated one column"><button className="positive ui button" onClick={() => setAddDoc(true)}>新增</button></div>
      <div className="right floated right aligned one column">
        <span className="ui label">
          <i className="signal icon"></i>{total}
        </span>
        <div className="ui pagination menu">
        <a className={`icon ${
          currentPage===1 && 'disabled'
          } item`} onClick={() => {
            if (currentPage===1) {
              return;
            }
            setCurrentPage(currentPage-1);
        }}>
          <i className="left chevron icon"></i>
        </a>
        { navs }
        <a className={`icon ${
        (currentPage === pages || pages === 0) && 'disabled'
          } item`} onClick={()=>{
            if(currentPage===pages){
              return;
            }
            setCurrentPage(currentPage+1);
        }}>
          <i className="right chevron icon"></i>
        </a></div>
      </div></div>
    </th>
  </tr></tfoot>
</table>
  </div></>
}