import { Button, Modal, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface DataType {
    key: React.ReactNode;
    parameters: string;
}

const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
    },
    hideSelectAll: true,
};

const ignoreFields = ["Untitled_Field", "Vendor_Name", "Vendor_Code", "_id"]
const keyName: any = {
    Image_1: "Image",
    Program_Name: "Program Name",
    Item_name: "Item Name",
    Markets: "Markets"
}


const Comparison_Table_POC: React.FC = () => {
    const [selectedColumn, setSelectedColumn] = useState<string>();
    const [contentLoaded, setContentLoaded] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [currentImageUrl, setCurrentImageURL] = useState("");

    function getTitleWithCheckbox(key: string, title: string) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent:"space-between" }} >
                {/* <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                    onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox> */}
                <p>{title}</p>

                <Button>Select</Button>
            </div>
        )
    }


    function buildColumns(vendor: any) {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: `${20}%`,
            render: (text: string, record: any) => ({
                children: <RowRender text={keyName[text] ? keyName[text] : text.replaceAll("_"," ")} mergeCell={record.mergeCell} />
            }),
        }];
        console.log("Table.SELECTION_COLUMN", Table.SELECTION_COLUMN)
        Object.keys(vendor).map((key: any) => {
            columns.push({
                title: getTitleWithCheckbox(key, vendor[key]),
                dataIndex: key,
                key: key,
                render: (text: string, record: any) => ({
                    children: <RowRender setCurrentImageURL={setCurrentImageURL} text={text || 0} record={record} />
                }),
            })
        })
        console.log("columns", columns)
        setColumns([...columns])
    }


    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let item_code = await KFSDK.app.page.popup.getAllParameters();
            console.log("item_code", item_code)
            const vendorCatalog = await getProductSuppliers(item_code);
            const vendor: any = {};
            const rows: any = []

            if (vendorCatalog.length > 0) {
                const rowKeys = Object.keys(vendorCatalog[0]).filter((key) => !ignoreFields.includes(key))
                vendorCatalog.forEach(({ Vendor_Name, Vendor_Code, ...rest }: any) => {
                    if (!(Vendor_Code in vendor)) {
                        vendor[Vendor_Code] = Vendor_Name;
                    }
                })

                rowKeys.map((key) => {
                    let data: any = { parameters: key }
                    vendorCatalog.forEach((vendor: any) => {
                        if(key == "Image_1") {
                            data[vendor.Vendor_Code] = `${process.env.REACT_APP_API_URL}/view/filepreview/form/Vendor_Catalog_A00/${vendor._id}/Image_1?fileindex=0`;
                        } else {
                            data[vendor.Vendor_Code] = vendor[key];
                        }
                        
                        data["key"] = key + vendor._id;
                    })
                    rows.push(data)
                })

            }
            console.log("rows", rows)
            setData(rows);
            buildColumns(vendor);
            setContentLoaded(true)
        })()
    }, [])

    const getProductSuppliers = async (item_code: string) => {
        const queries = `page_number=1&page_size=100000`

        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "OR": [
                            {
                                "LHSField": "Untitled_Field",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": item_code,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            }
                        ]
                    }
                ]
            }
        }

        const productItems: any = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Vendor_Catalog_A00/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return productItems;
    }



    return (
        <div>
            {contentLoaded ?
                <Table
                    columns={columns}
                    // rowSelection={{ ...rowSelection }}
                    dataSource={data}
                    bordered
                    pagination={false}
                    className="custom-table"
                /> : "Loading..."}

            <Modal open={Boolean(currentImageUrl)} onCancel={() => setCurrentImageURL("")} >
                <img src={currentImageUrl} ></img>
            </Modal>
        </div>
    );
};

function RowRender({ text, record, setCurrentImageURL }: any) {
    console.log("fdnjfdnfdnklfndklfnkdjlfnjk", text, record, record?.parameters)
    return (
        <div style={{ paddingLeft: 10 }}>
            {record?.parameters == "Image_1" ?
                <div>
                    <a
                    href={text}
                    target='_blank'
                    >
                        Preview Image
                    </a>
                </div>
                :
                <div >
                    {text}
                </div>}
        </div>
    )
}

export { Comparison_Table_POC };
